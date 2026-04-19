import {
  type WorkspaceSsoIdentityProviderEntity,
  IdentityProviderType,
  SsoIdentityProviderStatus,
} from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';
import { getAuthProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/get-auth-providers-by-workspace.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('getAuthProvidersByWorkspace', () => {
  const mockWorkspace = {
    isGoogleAuthEnabled: true,
    isPasswordAuthEnabled: true,
    isMicrosoftAuthEnabled: false,
    workspaceSsoIdentityProviders: [
      {
        id: 'Sso1',
        name: 'Sso Provider 1',
        type: IdentityProviderType.Saml,

        status: SsoIdentityProviderStatus.Active,
        issuer: 'Sso1.example.com',
      },
    ],
  } as unknown as WorkspaceEntity;

  it('should return correct auth providers for given workspace', () => {
    const result = getAuthProvidersByWorkspace({
      workspace: mockWorkspace,
      systemEnabledProviders: {
        google: true,
        magicLink: false,
        password: true,
        microsoft: true,
        Sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      Sso: [
        {
          id: 'Sso1',
          name: 'Sso Provider 1',
          type: IdentityProviderType.Saml,

          status: SsoIdentityProviderStatus.Active,
          issuer: 'Sso1.example.com',
        },
      ],
    });
  });

  it('should handle workspace with no Sso providers', () => {
    const result = getAuthProvidersByWorkspace({
      workspace: { ...mockWorkspace, workspaceSsoIdentityProviders: [] },
      systemEnabledProviders: {
        google: true,
        magicLink: false,
        password: true,
        microsoft: true,
        Sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      Sso: [],
    });
  });
  it('should handle workspace with Sso providers inactive', () => {
    const result = getAuthProvidersByWorkspace({
      workspace: {
        ...mockWorkspace,
        workspaceSsoIdentityProviders: [
          {
            id: 'Sso1',
            name: 'Sso Provider 1',
            type: IdentityProviderType.Saml,
            status: SsoIdentityProviderStatus.Inactive,
            issuer: 'Sso1.example.com',
          } as WorkspaceSsoIdentityProviderEntity,
        ],
      },
      systemEnabledProviders: {
        google: true,
        magicLink: false,
        password: true,
        microsoft: true,
        Sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      Sso: [],
    });
  });

  it('should disable Microsoft auth if isMicrosoftAuthEnabled is false', () => {
    const result = getAuthProvidersByWorkspace({
      workspace: { ...mockWorkspace, isMicrosoftAuthEnabled: false },
      systemEnabledProviders: {
        google: true,
        magicLink: false,
        password: true,
        microsoft: true,
        Sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      Sso: [
        {
          id: 'Sso1',
          name: 'Sso Provider 1',
          type: IdentityProviderType.Saml,

          status: SsoIdentityProviderStatus.Active,
          issuer: 'Sso1.example.com',
        },
      ],
    });
  });
});

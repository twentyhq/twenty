import {
  type WorkspaceSSOIdentityProviderEntity,
  IdentityProviderType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { getAuthProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/get-auth-providers-by-workspace.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('getAuthProvidersByWorkspace', () => {
  const mockWorkspace = {
    isGoogleAuthEnabled: true,
    isPasswordAuthEnabled: true,
    isMicrosoftAuthEnabled: false,
    workspaceSSOIdentityProviders: [
      {
        id: 'sso1',
        name: 'SSO Provider 1',
        type: IdentityProviderType.SAML,

        status: SSOIdentityProviderStatus.Active,
        issuer: 'sso1.example.com',
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
        sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      sso: [
        {
          id: 'sso1',
          name: 'SSO Provider 1',
          type: IdentityProviderType.SAML,

          status: SSOIdentityProviderStatus.Active,
          issuer: 'sso1.example.com',
        },
      ],
    });
  });

  it('should handle workspace with no SSO providers', () => {
    const result = getAuthProvidersByWorkspace({
      workspace: { ...mockWorkspace, workspaceSSOIdentityProviders: [] },
      systemEnabledProviders: {
        google: true,
        magicLink: false,
        password: true,
        microsoft: true,
        sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      sso: [],
    });
  });
  it('should handle workspace with SSO providers inactive', () => {
    const result = getAuthProvidersByWorkspace({
      workspace: {
        ...mockWorkspace,
        workspaceSSOIdentityProviders: [
          {
            id: 'sso1',
            name: 'SSO Provider 1',
            type: IdentityProviderType.SAML,
            status: SSOIdentityProviderStatus.Inactive,
            issuer: 'sso1.example.com',
          } as WorkspaceSSOIdentityProviderEntity,
        ],
      },
      systemEnabledProviders: {
        google: true,
        magicLink: false,
        password: true,
        microsoft: true,
        sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      sso: [],
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
        sso: [],
      },
    });

    expect(result).toEqual({
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
      sso: [
        {
          id: 'sso1',
          name: 'SSO Provider 1',
          type: IdentityProviderType.SAML,

          status: SSOIdentityProviderStatus.Active,
          issuer: 'sso1.example.com',
        },
      ],
    });
  });
});

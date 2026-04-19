import { isDefined } from 'twenty-shared/utils';

import {
  SsoIdentityProviderStatus,
  type WorkspaceSsoIdentityProviderEntity,
} from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';
import { type AuthProvidersDTO } from 'src/engine/core-modules/workspace/dtos/public-workspace-data.dto';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const getAuthProvidersByWorkspace = ({
  workspace,
  systemEnabledProviders,
}: {
  workspace: Pick<
    WorkspaceEntity,
    | 'isGoogleAuthEnabled'
    | 'isPasswordAuthEnabled'
    | 'isMicrosoftAuthEnabled'
    | 'workspaceSsoIdentityProviders'
  >;
  systemEnabledProviders: AuthProvidersDTO;
}) => {
  return {
    google: workspace.isGoogleAuthEnabled && systemEnabledProviders.google,
    magicLink: false,
    password:
      workspace.isPasswordAuthEnabled && systemEnabledProviders.password,
    microsoft:
      workspace.isMicrosoftAuthEnabled && systemEnabledProviders.microsoft,
    Sso: workspace.workspaceSsoIdentityProviders
      .map((identityProvider: WorkspaceSsoIdentityProviderEntity) =>
        identityProvider.status === SsoIdentityProviderStatus.Active
          ? {
              id: identityProvider.id,
              name: identityProvider.name,
              type: identityProvider.type,
              status: identityProvider.status,
              issuer: identityProvider.issuer,
            }
          : undefined,
      )
      .filter(isDefined),
  };
};

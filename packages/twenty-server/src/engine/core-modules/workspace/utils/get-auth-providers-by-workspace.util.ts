import { isDefined } from 'twenty-shared/utils';

import {
  SSOIdentityProviderStatus,
  type WorkspaceSSOIdentityProviderEntity,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { type AuthProvidersDTO } from 'src/engine/core-modules/workspace/dtos/public-workspace-data-output';
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
    | 'workspaceSSOIdentityProviders'
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
    sso: workspace.workspaceSSOIdentityProviders
      .map((identityProvider: WorkspaceSSOIdentityProviderEntity) =>
        identityProvider.status === SSOIdentityProviderStatus.Active
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

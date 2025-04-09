import { isDefined } from 'twenty-shared/utils';

import { SSOIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { AuthProviders } from 'src/engine/core-modules/workspace/dtos/public-workspace-data-output';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const getAuthProvidersByWorkspace = ({
  workspace,
  systemEnabledProviders,
}: {
  workspace: Pick<
    Workspace,
    | 'isGoogleAuthEnabled'
    | 'isPasswordAuthEnabled'
    | 'isMicrosoftAuthEnabled'
    | 'workspaceSSOIdentityProviders'
  >;
  systemEnabledProviders: AuthProviders;
}) => {
  return {
    google: workspace.isGoogleAuthEnabled && systemEnabledProviders.google,
    magicLink: false,
    password:
      workspace.isPasswordAuthEnabled && systemEnabledProviders.password,
    microsoft:
      workspace.isMicrosoftAuthEnabled && systemEnabledProviders.microsoft,
    sso: workspace.workspaceSSOIdentityProviders
      .map((identityProvider) =>
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

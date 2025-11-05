import { type AuthBypassProvidersDTO } from 'src/engine/core-modules/workspace/dtos/public-workspace-data-output';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const getAuthBypassProvidersByWorkspace = ({
  workspace,
  systemEnabledProviders,
}: {
  workspace: Pick<
    WorkspaceEntity,
    | 'isGoogleAuthBypassEnabled'
    | 'isPasswordAuthBypassEnabled'
    | 'isMicrosoftAuthBypassEnabled'
  >;
  systemEnabledProviders: AuthBypassProvidersDTO;
}) => {
  return {
    google:
      workspace.isGoogleAuthBypassEnabled && systemEnabledProviders.google,
    password:
      workspace.isPasswordAuthBypassEnabled && systemEnabledProviders.password,
    microsoft:
      workspace.isMicrosoftAuthBypassEnabled &&
      systemEnabledProviders.microsoft,
  };
};

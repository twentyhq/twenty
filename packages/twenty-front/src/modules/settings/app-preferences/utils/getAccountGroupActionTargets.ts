import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type AccountGroupAction } from '@/settings/app-preferences/types/AccountGroupAction';
import { type AccountGroupActionTarget } from '@/settings/app-preferences/types/AccountGroupActionTarget';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getInstalledApplicationDisplayName } from '@/settings/app-preferences/utils/getInstalledApplicationDisplayName';
import { isDefined } from 'twenty-shared/utils';

export const getAccountGroupActionTargets = <
  TConnectedAccount extends Pick<
    ConnectedAccount,
    'id' | 'handle' | 'applicationId' | 'archivedAt'
  >,
>({
  group,
  action,
  currentWorkspace,
}: {
  group: ConnectedAccountGroup<TConnectedAccount>;
  action: AccountGroupAction;
  currentWorkspace:
    | Pick<
        CurrentWorkspace,
        'installedApplications' | 'workspaceCustomApplication'
      >
    | null
    | undefined;
}): AccountGroupActionTarget[] => {
  const isTargeted = (connection: TConnectedAccount) =>
    action === 'delete' || !isDefined(connection.archivedAt);

  const builtInAccountTargets = [group.builtInAccount]
    .filter(isDefined)
    .filter(isTargeted)
    .map(({ id, handle }) => ({ id, label: handle }));

  const appAccountTargets = group.appAccounts
    .filter(isTargeted)
    .map(({ id, applicationId }) => ({
      id,
      label: getInstalledApplicationDisplayName({
        applicationId,
        currentWorkspace,
      }),
    }));

  return [...builtInAccountTargets, ...appAccountTargets];
};

import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const canManageConnectedAccount = ({
  account,
  userWorkspaceId,
  canManageWorkspace,
  canManageApplications,
}: {
  account: Pick<
    ConsolidatedConnectedAccount,
    'userWorkspaceId' | 'visibility' | 'provider'
  >;
  userWorkspaceId: string | undefined;
  canManageWorkspace: boolean;
  canManageApplications: boolean;
}) =>
  (isDefined(userWorkspaceId) && account.userWorkspaceId === userWorkspaceId) ||
  (account.visibility === 'workspace' &&
    (account.provider === ConnectedAccountProvider.APP
      ? canManageApplications
      : canManageWorkspace));

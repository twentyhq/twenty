import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Their own account first, then one shared with the whole workspace: composing from whichever account comes first in the workspace puts the caller's mail in a colleague's mailbox.
export const selectConnectedAccountIdForCaller = ({
  connectedAccounts,
  userWorkspaceId,
}: {
  connectedAccounts: Pick<
    ConnectedAccountEntity,
    'id' | 'visibility' | 'userWorkspaceId'
  >[];
  userWorkspaceId: string;
}): string | undefined => {
  const ownAccount = connectedAccounts.find(
    (connectedAccount) => connectedAccount.userWorkspaceId === userWorkspaceId,
  );

  const usableAccount =
    ownAccount ??
    connectedAccounts.find((connectedAccount) =>
      isConnectedAccountUsableByCaller({ connectedAccount, userWorkspaceId }),
    );

  return usableAccount?.id;
};

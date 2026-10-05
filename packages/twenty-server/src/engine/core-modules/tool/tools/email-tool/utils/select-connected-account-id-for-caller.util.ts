import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

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

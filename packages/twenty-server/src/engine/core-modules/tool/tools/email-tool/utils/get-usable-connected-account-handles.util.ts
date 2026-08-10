import { isDefined } from 'twenty-shared/utils';

import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Only the handles the caller may actually send from, so the "unknown handle"
// error can list the valid choices without disclosing a colleague's private
// connected account.
export const getUsableConnectedAccountHandles = ({
  connectedAccounts,
  userWorkspaceId,
}: {
  connectedAccounts: Pick<
    ConnectedAccountEntity,
    'handle' | 'visibility' | 'userWorkspaceId'
  >[];
  userWorkspaceId?: string;
}): string[] => {
  const usableConnectedAccounts = isDefined(userWorkspaceId)
    ? connectedAccounts.filter((connectedAccount) =>
        isConnectedAccountUsableByCaller({ connectedAccount, userWorkspaceId }),
      )
    : connectedAccounts;

  return [
    ...new Set(
      usableConnectedAccounts
        .map((connectedAccount) => connectedAccount.handle)
        .filter((handle) => handle.length > 0),
    ),
  ];
};

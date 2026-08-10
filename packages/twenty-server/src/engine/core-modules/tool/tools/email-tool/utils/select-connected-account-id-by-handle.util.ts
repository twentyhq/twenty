import { isDefined } from 'twenty-shared/utils';

import { normalizeConnectedAccountHandle } from 'src/engine/core-modules/tool/tools/email-tool/utils/normalize-connected-account-handle.util';
import { selectConnectedAccountIdForCaller } from 'src/engine/core-modules/tool/tools/email-tool/utils/select-connected-account-id-for-caller.util';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Matches on the primary handle only: `handleAliases` are addresses the mailbox
// receives on, but the provider still stamps the primary handle as the sender,
// so resolving an alias here would silently send from a different address than
// the one that was asked for.
export const selectConnectedAccountIdByHandle = ({
  connectedAccounts,
  handle,
  userWorkspaceId,
}: {
  connectedAccounts: Pick<
    ConnectedAccountEntity,
    'id' | 'handle' | 'visibility' | 'userWorkspaceId'
  >[];
  handle: string;
  userWorkspaceId?: string;
}): string | undefined => {
  const normalizedHandle = normalizeConnectedAccountHandle(handle);

  const matchingConnectedAccounts = connectedAccounts.filter(
    (connectedAccount) =>
      normalizeConnectedAccountHandle(connectedAccount.handle) ===
      normalizedHandle,
  );

  if (!isDefined(userWorkspaceId)) {
    return matchingConnectedAccounts[0]?.id;
  }

  return selectConnectedAccountIdForCaller({
    connectedAccounts: matchingConnectedAccounts,
    userWorkspaceId,
  });
};

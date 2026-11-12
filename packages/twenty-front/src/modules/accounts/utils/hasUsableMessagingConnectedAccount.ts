import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { isDefined } from 'twenty-shared/utils';

export const hasUsableMessagingConnectedAccount = ({
  connectedAccounts,
  messageChannels,
}: {
  connectedAccounts: Pick<
    ConnectedAccount,
    'id' | 'authFailedAt' | 'archivedAt'
  >[];
  messageChannels: Pick<MessageChannel, 'connectedAccountId'>[];
}): boolean =>
  messageChannels.some(({ connectedAccountId }) =>
    connectedAccounts.some(
      (connectedAccount) =>
        connectedAccount.id === connectedAccountId &&
        !isDefined(connectedAccount.authFailedAt) &&
        !isDefined(connectedAccount.archivedAt),
    ),
  );

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { filterConnectedAccountsAbleToSendEmail } from '@/accounts/utils/filterConnectedAccountsAbleToSendEmail';
import { type ConnectedAccountEmailFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const hasUsableMessagingConnectedAccount = ({
  connectedAccounts,
  messageChannels,
}: {
  connectedAccounts: (Pick<
    ConnectedAccount,
    'id' | 'authFailedAt' | 'archivedAt'
  > &
    ConnectedAccountEmailFields)[];
  messageChannels: Pick<MessageChannel, 'connectedAccountId'>[];
}): boolean => {
  const usableConnectedAccounts = connectedAccounts.filter(
    (connectedAccount) =>
      !isDefined(connectedAccount.authFailedAt) &&
      !isDefined(connectedAccount.archivedAt),
  );

  return (
    usableConnectedAccounts.some(({ id }) =>
      messageChannels.some(
        ({ connectedAccountId }) => connectedAccountId === id,
      ),
    ) ||
    filterConnectedAccountsAbleToSendEmail(usableConnectedAccounts).length > 0
  );
};

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type ConnectedAccountSender } from '@/accounts/types/ConnectedAccountSender';
import { buildConnectedAccountSenderOptions } from '@/accounts/utils/buildConnectedAccountSenderOptions';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
import { getSendableEmailHandles, isDefined } from 'twenty-shared/utils';

export const getEmailComposerSenderPicker = ({
  sendableAccounts,
  appSender,
  sender,
}: {
  sendableAccounts: Pick<ConnectedAccount, 'id' | 'handle' | 'handleAliases'>[];
  appSender?: Pick<AppReplyTarget, 'connectedAccountId' | 'handle'> | null;
  sender: ConnectedAccountSender;
}) => {
  // the app option is keyed by account id, since its handle can also be a native mailbox's
  const options = [
    ...(isDefined(appSender)
      ? [{ label: appSender.handle, value: appSender.connectedAccountId }]
      : []),
    ...buildConnectedAccountSenderOptions(sendableAccounts),
  ];

  const selectedAccount = sendableAccounts.find(
    (account) => account.id === sender.connectedAccountId,
  );

  const selectedValue =
    sender.connectedAccountId === appSender?.connectedAccountId
      ? appSender.connectedAccountId
      : (sender.fromHandle ?? selectedAccount?.handle);

  const getSenderForValue = (value: string): ConnectedAccountSender | null => {
    if (isDefined(appSender) && value === appSender.connectedAccountId) {
      return { connectedAccountId: appSender.connectedAccountId };
    }

    const senderAccount = sendableAccounts.find((account) =>
      getSendableEmailHandles(account).includes(value),
    );

    return isDefined(senderAccount)
      ? { connectedAccountId: senderAccount.id, fromHandle: value }
      : null;
  };

  return { options, selectedValue, getSenderForValue };
};

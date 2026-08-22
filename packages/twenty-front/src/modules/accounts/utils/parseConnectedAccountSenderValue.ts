import { CONNECTED_ACCOUNT_SENDER_VALUE_SEPARATOR } from '@/accounts/constants/ConnectedAccountSenderValueSeparator';
import { type ConnectedAccountSender } from '@/accounts/types/ConnectedAccountSender';

export const parseConnectedAccountSenderValue = (
  value: string,
): ConnectedAccountSender => {
  const separatorIndex = value.indexOf(
    CONNECTED_ACCOUNT_SENDER_VALUE_SEPARATOR,
  );

  if (separatorIndex === -1) {
    return { connectedAccountId: value };
  }

  return {
    connectedAccountId: value.slice(0, separatorIndex),
    fromHandle: value.slice(separatorIndex + 1),
  };
};

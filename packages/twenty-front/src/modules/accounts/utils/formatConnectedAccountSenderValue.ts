import { CONNECTED_ACCOUNT_SENDER_VALUE_SEPARATOR } from '@/accounts/constants/ConnectedAccountSenderValueSeparator';

export const formatConnectedAccountSenderValue = (
  connectedAccountId: string,
  handle: string,
) =>
  `${connectedAccountId}${CONNECTED_ACCOUNT_SENDER_VALUE_SEPARATOR}${handle}`;

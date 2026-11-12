// Mirrors MarkAppThreadAsReadPayload, which twenty-sdk ships from 2.59; import it from there once the pin is bumped.
export type MarkAppThreadAsReadPayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  threadExternalId: string;
};

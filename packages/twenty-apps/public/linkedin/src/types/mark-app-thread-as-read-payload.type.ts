// Mirrors MarkAppThreadAsReadPayload from twenty-sdk 2.57; import it from there once the pin is bumped.
export type MarkAppThreadAsReadPayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  threadExternalId: string;
};

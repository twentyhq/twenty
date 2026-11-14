export type StartAppConversationRecipient = {
  personId: string;
  displayName: string | null;
  handle: string | null;
};

export type StartAppConversationPayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  text: string;
  idempotencyKey: string;
  recipients: StartAppConversationRecipient[];
};

export type StartAppConversationResult = {
  externalId: string;
  threadExternalId: string;
  sentAt?: string;
  recipients?: { personId: string; handle: string }[];
};

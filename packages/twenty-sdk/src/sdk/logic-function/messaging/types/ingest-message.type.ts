import { type MessageParticipantRole } from 'twenty-shared/types';

export type IngestMessageParticipant = {
  // 'FROM' marks the sender; exactly one participant must carry it. When its
  // handle equals the channel's, the message is recorded as outgoing.
  role: MessageParticipantRole;
  // The participant's identity on the provider, in the same namespace as the
  // channel's own handle.
  handle: string;
  displayName?: string;
};

export type IngestMessage = {
  // The provider's id for this message. Ingesting it twice is a no-op, so
  // redelivered webhooks are safe to replay.
  externalId: string;
  // The provider's id for the conversation. Messages sharing one land in the
  // same Message Thread.
  threadExternalId: string;
  // Most non-email providers have none; the thread falls back to its
  // participants for a title.
  subject?: string;
  text: string;
  receivedAt: Date;
  participants: IngestMessageParticipant[];
};

export type IngestedMessage = {
  externalId: string;
  // Stable across re-ingestion, so it is safe to hang timeline activities or
  // your own records off it.
  messageId: string;
  messageThreadId: string;
};

import { type MessageParticipantRole } from 'twenty-shared/types';

export type IngestMessageParticipant = {
  // Exactly one participant must be 'FROM'; when its handle equals the channel's, the message is outgoing
  role: MessageParticipantRole | `${MessageParticipantRole}`;
  // Same namespace as the channel's own handle
  handle: string;
  // Omitting it on a later delivery keeps the stored name
  displayName?: string;
  // Handles cannot match People by email, so without this the thread lands on no record; re-ingesting links a late match
  personId?: string;
  // Attribution only: record-page placement is built from `personId` alone
  workspaceMemberId?: string;
};

export type IngestMessage = {
  // Ingesting it twice is a no-op, so redelivered webhooks are safe to replay
  externalId: string;
  // Messages sharing one land in the same Message Thread
  threadExternalId: string;
  // Most non-email providers have none; the thread then takes its title from participants
  subject?: string;
  text: string;
  receivedAt: Date;
  participants: IngestMessageParticipant[];
};

export type IngestedMessage = {
  externalId: string;
  // Stable across re-ingestion, so safe to hang timeline activities or your own records off
  messageId: string;
  messageThreadId: string;
};

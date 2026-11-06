import {
  type MessageDeliveryStatus,
  type MessageParticipantRole,
} from '@/sdk/define/common/types/loose-shared-types.type';

export type IngestMessageParticipant = {
  // Exactly one participant must be 'FROM'; when its handle equals the channel's, the message is outgoing
  role: MessageParticipantRole;
  // Same namespace as the channel's own handle
  handle: string;
  // Omitting it on a later delivery keeps the stored name
  displayName?: string;
  // Handles cannot match People by email, so without this the thread lands on no record; re-ingesting links a late match
  personId?: string;
  // Attribution only: record-page placement is built from `personId` alone
  workspaceMemberId?: string;
};

export type IngestMessageAttachment = {
  fileId: string;
  label: string;
};

export type IngestMessageReaction = {
  // Same namespace as participant handles
  handle: string;
  displayName?: string;
  emoji: string;
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
  folderExternalIds?: string[];
  attachments?: IngestMessageAttachment[];
  // Outgoing messages only; re-ingesting with a later status updates it, an earlier one is ignored
  deliveryStatus?: MessageDeliveryStatus;
  // The full current list: it replaces the stored reactions, so omit it to keep them
  reactions?: IngestMessageReaction[];
};

export type IngestedMessage = {
  externalId: string;
  // Stable across re-ingestion, so safe to hang timeline activities or your own records off
  messageId: string;
  messageThreadId: string;
  hasAttachments: boolean;
};

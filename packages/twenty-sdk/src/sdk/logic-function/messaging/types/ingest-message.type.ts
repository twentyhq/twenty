import { type MessageParticipantRole } from 'twenty-shared/types';

export type IngestMessageParticipant = {
  // 'FROM' marks the sender; exactly one participant must carry it. When its
  // handle equals the channel's, the message is recorded as outgoing.
  role: MessageParticipantRole;
  // The participant's identity on the provider, in the same namespace as the
  // channel's own handle.
  handle: string;
  // Omitting it on a later delivery keeps whatever name is already stored,
  // so enriching a participant with an identity does not require resending
  // the rest of the row.
  displayName?: string;
  // Twenty resolves email participants to People by email address, which
  // cannot match a provider handle. Supply the record yourself when you know
  // it — look the handle up against `Person.linkedinLink` or an identity
  // field your app added. Without it the participant stays unlinked and the
  // thread never appears on anyone's record page.
  //
  // Ingesting the same message again with an identity you have since
  // resolved links the existing participant, so a late match is not lost.
  personId?: string;
  // For a participant who is a member of this workspace rather than a contact.
  // Attribution only: record-page placement is built from `personId` alone, so
  // a participant linked only to a workspace member shows in the thread but
  // pulls the conversation onto no record.
  workspaceMemberId?: string;
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

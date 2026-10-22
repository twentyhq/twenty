import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';

export const isSameRecordSharingInvitationRecipient = ({
  recipient,
  otherRecipient,
}: {
  recipient: RecordSharingInvitationRecipient;
  otherRecipient: RecordSharingInvitationRecipient;
}) =>
  recipient.kind === otherRecipient.kind && recipient.id === otherRecipient.id;

import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';

export const isSameRecordSharingInvitationRecipient = ({
  recipient,
  otherRecipient,
}: {
  recipient: Pick<RecordSharingInvitationRecipient, 'kind' | 'id'>;
  otherRecipient: Pick<RecordSharingInvitationRecipient, 'kind' | 'id'>;
}) =>
  recipient.kind === otherRecipient.kind && recipient.id === otherRecipient.id;

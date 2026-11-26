import { type EmailReplyParticipant } from '@/activities/emails/types/EmailReplyParticipant';

export type EmailReplyMessage = {
  sender?: EmailReplyParticipant;
  messageParticipants: EmailReplyParticipant[];
};

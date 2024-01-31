import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export type EmailThreadMessage = {
  id: string;
  text: string;
  receivedAt: string;
  messageParticipants: EmailThreadMessageParticipant[];
};

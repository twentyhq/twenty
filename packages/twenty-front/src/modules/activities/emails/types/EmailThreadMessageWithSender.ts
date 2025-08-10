import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export type EmailThreadMessageWithSender = EmailThreadMessage & {
  sender: EmailThreadMessageParticipant;
};

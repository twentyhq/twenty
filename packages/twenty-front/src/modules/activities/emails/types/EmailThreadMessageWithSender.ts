import { EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export type EmailThreadMessageWithSender = EmailThreadMessage & {
  sender: EmailThreadMessageParticipant;
};

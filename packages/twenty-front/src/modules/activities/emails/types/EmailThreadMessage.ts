import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export type EmailThreadMessage = {
  id: string;
  text: string;
  receivedAt: string;
  subject: string;
  messageThreadId: string;
  messageParticipants: EmailThreadMessageParticipant[];
  __typename: 'EmailThreadMessage';
};

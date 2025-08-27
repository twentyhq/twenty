import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type MessageThread } from '@/activities/emails/types/MessageThread';

export type EmailThreadMessage = {
  id: string;
  text: string;
  receivedAt: string;
  subject: string;
  messageThreadId: string;
  messageParticipants: EmailThreadMessageParticipant[];
  messageThread: MessageThread;
  __typename: 'EmailThreadMessage';
};

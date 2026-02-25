import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type MessageThread } from '@/activities/emails/types/MessageThread';

export type EmailThreadMessageAttachment = {
  id: string;
  name: string;
  mimeType: string | null;
  size: number | null;
};

export type EmailThreadMessage = {
  id: string;
  text: string;
  receivedAt: string;
  subject: string;
  messageThreadId: string;
  messageParticipants: EmailThreadMessageParticipant[];
  messageAttachments: EmailThreadMessageAttachment[];
  messageThread: MessageThread;
  __typename: 'EmailThreadMessage';
};

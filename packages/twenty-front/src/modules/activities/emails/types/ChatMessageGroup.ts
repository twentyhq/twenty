import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

export type ChatMessageGroup = {
  id: string;
  isOutgoing: boolean;
  messages: EmailThreadMessageWithSender[];
};

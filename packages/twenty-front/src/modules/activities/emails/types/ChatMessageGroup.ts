import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

export type ChatMessageGroup = {
  id: string;
  isFirstOfDay: boolean;
  isOutgoing: boolean;
  messages: EmailThreadMessageWithSender[];
};

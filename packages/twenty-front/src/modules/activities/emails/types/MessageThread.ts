import { MessageThreadMember } from '@/activities/emails/types/MessageThreadMember';

export type MessageThread = {
  id: string;
  everyone: boolean;
  messageThreadMember: MessageThreadMember[];
};

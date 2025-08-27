import { type MessageThreadSubscriber } from '@/activities/emails/types/MessageThreadSubscriber';

export type MessageThread = {
  id: string;
  subscribers?: MessageThreadSubscriber[];
};

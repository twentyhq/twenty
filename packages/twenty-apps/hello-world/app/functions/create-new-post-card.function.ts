import type {
  FunctionConfig,
  DatabaseEventPayload,
  ObjectRecordCreateEvent,
  CronPayload,
} from 'twenty-sdk';
import { type Person } from '../../generated';
import { createNewPostCard } from '../../src/actions/create-new-post-card';

type CreateNewPostCardParams =
  | { name?: string }
  | DatabaseEventPayload<ObjectRecordCreateEvent<Person>>
  | CronPayload;

export const main = async (params: CreateNewPostCardParams) =>
  createNewPostCard(params);

export const config: FunctionConfig = {
  universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
  name: 'create-new-post-card',
  timeoutSeconds: 2,
  triggers: [
    {
      universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
      type: 'route',
      path: '/post-card/create',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
    {
      universalIdentifier: 'dd802808-0695-49e1-98c9-d5c9e2704ce2',
      type: 'cron',
      pattern: '0 0 1 1 *', // Every year 1st of January
    },
    {
      universalIdentifier: '203f1df3-4a82-4d06-a001-b8cf22a31156',
      type: 'databaseEvent',
      eventName: 'person.created',
    },
  ],
};

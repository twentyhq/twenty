import type {
  CronPayload,
  DatabaseEventPayload,
  ObjectRecordCreateEvent,
} from 'twenty-sdk';
import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient, type Person } from 'twenty-sdk/core-api';

type CreateNewPostCardParams =
  | { name?: string }
  | DatabaseEventPayload<ObjectRecordCreateEvent<Person>>
  | CronPayload;

const handler = async (params: CreateNewPostCardParams) => {
  try {
    const client = new CoreApiClient();

    const name =
      'name' in params
        ? params.name ?? process.env.DEFAULT_RECIPIENT_NAME ?? 'Hello world'
        : 'Hello world';

    // TODO: restore after first sync creates the PostCard object on the server
    // const createPostCard = await client.mutation({
    //   createPostCard: {
    //     __args: {
    //       data: {
    //         name,
    //       },
    //     },
    //     name: true,
    //     id: true,
    //   },
    // });

    console.log('createPostCard handler called with name:', name);

    return { name };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
  name: 'create-new-post-card',
  timeoutSeconds: 2,
  handler,
  httpRouteTriggerSettings: {
    path: '/post-card/create',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
  cronTriggerSettings: {
    pattern: '0 0 1 1 *', // Every year 1st of January
  },
  databaseEventTriggerSettings: {
    eventName: 'person.created',
  },
});

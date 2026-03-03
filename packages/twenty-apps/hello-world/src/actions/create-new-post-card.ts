import {
  defineLogicFunction,
  type CronPayload,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk';
import { CoreApiClient as Twenty, type CoreSchema } from 'twenty-sdk/generated';

type CreateNewPostCardParams =
  | { name?: string }
  | DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Person>>
  | CronPayload;

const handler = async (params: CreateNewPostCardParams) => {
  const client = new Twenty();

  const name =
    'name' in params
      ? params.name ?? process.env.DEFAULT_RECIPIENT_NAME ?? 'Hello world'
      : 'Hello world';

  const createPostCard = await client.mutation({
    createPostCard: {
      __args: {
        data: {
          name,
        },
      },
      name: true,
      id: true,
    },
  });

  console.log('createPostCard result', createPostCard);

  return createPostCard;
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
    pattern: '0 0 1 1 *',
  },
  databaseEventTriggerSettings: {
    eventName: 'person.created',
  },
});

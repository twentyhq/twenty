import { EntityManager } from 'typeorm';

const tableName = 'messageThreadSubscriber';

export const DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS = {
  MESSAGE_THREAD_SUBSCRIBER_1: '20202020-cc69-44ef-a82c-600c0dbf39ba',
  MESSAGE_THREAD_SUBSCRIBER_2: '20202020-d80e-4a13-b10b-72ba09082668',
  MESSAGE_THREAD_SUBSCRIBER_3: '20202020-e6ec-4c8a-b431-0901eaf395a9',
  MESSAGE_THREAD_SUBSCRIBER_4: '20202020-1455-4c57-afaf-dd5dc086361d',
  MESSAGE_THREAD_SUBSCRIBER_5: '20202020-f79e-40dd-bd06-c36e6abb4678',
  MESSAGE_THREAD_SUBSCRIBER_6: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
  MESSAGE_THREAD_SUBSCRIBER_7: '20202020-c21e-4ec2-873b-de4264d89025',
};

export const DEV_SEED_MESSAGE_THREAD_IDS = {
  MESSAGE_THREAD_1: '20202020-8bfa-453b-b99b-bc435a7d4da8',
  MESSAGE_THREAD_2: '20202020-634a-4fde-aa7c-28a0eaf203ca',
  MESSAGE_THREAD_3: '20202020-1b56-4f10-a2fa-2ccaddf81f6c',
  MESSAGE_THREAD_4: '20202020-d51c-485a-b1b6-ed7c63e05d72',
};

export const DEV_SEED_USER_IDS = {
  TIM: '20202020-0687-4c41-b707-ed1bfca972a7',
  PHIL: '20202020-1553-45c6-a028-5a9064cce07f',
  JONY: '20202020-77d5-4cb6-b60a-f4a835a85d61',
};

export const seedMessageThreadSubscribers = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'messageThreadId',
      'workspaceMemberId',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS.MESSAGE_THREAD_SUBSCRIBER_1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_1,
        workspaceMemberId: DEV_SEED_USER_IDS.PHIL,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS.MESSAGE_THREAD_SUBSCRIBER_2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_1,
        workspaceMemberId: DEV_SEED_USER_IDS.JONY,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS.MESSAGE_THREAD_SUBSCRIBER_3,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_2,
        workspaceMemberId: DEV_SEED_USER_IDS.TIM,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS.MESSAGE_THREAD_SUBSCRIBER_4,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_3,
        workspaceMemberId: DEV_SEED_USER_IDS.JONY,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS.MESSAGE_THREAD_SUBSCRIBER_5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_4,
        workspaceMemberId: DEV_SEED_USER_IDS.TIM,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS.MESSAGE_THREAD_SUBSCRIBER_6,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_4,
        workspaceMemberId: DEV_SEED_USER_IDS.PHIL,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_SUBSCRIBERS_IDS.MESSAGE_THREAD_SUBSCRIBER_7,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_4,
        workspaceMemberId: DEV_SEED_USER_IDS.JONY,
      },
    ])
    .execute();
};

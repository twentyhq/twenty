import { EntityManager } from 'typeorm';

const tableName = 'messageThreadMember';

export const DEV_SEED_MESSAGE_THREAD_MEMBERS_IDS = {
  MESSAGE_THREAD_MEMBER_1: '20202020-cc69-44ef-a82c-600c0dbf39ba',
  MESSAGE_THREAD_MEMBER_2: '20202020-d80e-4a13-b10b-72ba09082668',
};

export const DEV_SEED_MESSAGE_THREAD_IDS = {
  MESSAGE_THREAD_1: '20202020-8bfa-453b-b99b-bc435a7d4da8',
};

export const DEV_SEED_USER_IDS = {
  PHIL: '20202020-1553-45c6-a028-5a9064cce07f',
  JONY: '20202020-77d5-4cb6-b60a-f4a835a85d61',
};

export const seedMessageThreadMember = async (
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
        id: DEV_SEED_MESSAGE_THREAD_MEMBERS_IDS.MESSAGE_THREAD_MEMBER_1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_1,
        workspaceUserId: DEV_SEED_USER_IDS.PHIL,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_MEMBERS_IDS.MESSAGE_THREAD_MEMBER_2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadId: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_1,
        workspaceUserId: DEV_SEED_USER_IDS.JONY,
      },
    ])
    .execute();
};

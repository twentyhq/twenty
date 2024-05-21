import { EntityManager } from 'typeorm';

const tableName = 'messageThreadMembers';

export const DEV_SEED_MESSAGE_THREAD_MEMBERS_IDS = {
  MESSAGE_THREAD_MEMBER_1: '20202020-cc69-44ef-a82c-600c0dbf39ba',
};

export const DEV_SEED_MESSAGE_THREAD_IDS = {
  MESSAGE_THREAD_1: '20202020-8bfa-453b-b99b-bc435a7d4da8',
};

export const DEV_SEED_USER_IDS = {
  PHIL: '20202020-1553-45c6-a028-5a9064cce07f',
};

export const seedMessageThreadMembers = async (
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
    ])
    .execute();
};

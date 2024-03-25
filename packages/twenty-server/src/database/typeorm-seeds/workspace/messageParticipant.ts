import { DataSource } from 'typeorm';

const tableName = 'messageParticipant';

export const seedMessageParticipant = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'workspaceMemberId',
      'personId',
      'displayName',
      'handle',
      'role',
      'messageId',
    ])
    .orIgnore()
    .values([
      {
        id: '0f2ae856-3434-49d8-8aa2-ec8786153a0b',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        displayName: 'Christoph',
        handle: 'outgoing',
        role: 'from',
        messageId: '99ef24a8-2b8a-405d-8f42-e820ca921421',
      },
      {
        id: '4e8384c2-1659-41ec-93e2-fd70ff09f68c',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '0aa00beb-ac73-4797-824e-87a1f5aea9e0',
        displayName: 'Sylvie',
        handle: 'incoming',
        role: 'to',
        messageId: '99ef24a8-2b8a-405d-8f42-e820ca921421',
      },
      {
        id: 'e716f5ba-c18c-4dd5-ac61-3315bc559e2d',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
        displayName: 'Christopher',
        handle: 'incoming',
        role: 'to',
        messageId: '99ef24a8-2b8a-405d-8f42-e820ca921421',
      },
      {
        id: 'fc7db84a-e8d2-4ad8-9aea-b78bcbf79cdd',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        displayName: 'Christoph',
        handle: 'outgoing',
        role: 'from',
        messageId: '8f804a9a-04c8-4f24-93f2-764948e95014',
      },
      {
        id: '564c135b-5047-4a3c-abbf-e942e8c3f9c9',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '0aa00beb-ac73-4797-824e-87a1f5aea9e0',
        displayName: 'Sylvie',
        handle: 'incoming',
        role: 'to',
        messageId: '8f804a9a-04c8-4f24-93f2-764948e95014',
      },
      {
        id: '7e4a370e-6110-489a-ba6b-1ae6b7d721ac',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
        displayName: 'Christopher',
        handle: 'incoming',
        role: 'to',
        messageId: '8f804a9a-04c8-4f24-93f2-764948e95014',
      },
    ])
    .execute();
};

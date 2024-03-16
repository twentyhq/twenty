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
        displayName: 'Tim',
        handle: 'outgoing',
        role: 'to',
        messageId: '99ef24a8-2b8a-405d-8f42-e820ca921421',
      },
      {
        id: '4e8384c2-1659-41ec-93e2-fd70ff09f68c',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '',
        displayName: 'Christoph',
        handle: 'incoming',
        role: 'from',
        messageId: '8f804a9a-04c8-4f24-93f2-764948e95014',
      },
      {
        id: 'e716f5ba-c18c-4dd5-ac61-3315bc559e2d',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '',
        displayName: '',
        handle: 'incoming',
        role: 'from',
        messageId: '3939d68a-ac6b-4f86-87a2-5f5f9d1b6481',
      },
      {
        id: '2afdc45d-9842-45b0-a87b-06589b7910b7',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        personId: '',
        displayName: '',
        handle: 'incoming',
        role: 'from',
        messageId: 'df85506a-6127-46bd-bcea-85db936b163d',
      },
    ])
    .execute();
};

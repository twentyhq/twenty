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
      'messageId',
      'personId',
      'workspaceMemberId',
      'createdAt',
      'deletedAt',
      'displayName',
      'handle',
      'role',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: '0f2ae856-3434-49d8-8aa2-ec8786153a0b',
        messageId: '99ef24a8-2b8a-405d-8f42-e820ca921421',
        personId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5', 
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7', 
        createdAt: new Date(),
        deletedAt: null,
        displayName: 'Tim',
        handle: 'outgoing', 
        role: 'to', 
        updatedAt: new Date(),
      },
      {
        id: '4e8384c2-1659-41ec-93e2-fd70ff09f68c',
        messageId: '8f804a9a-04c8-4f24-93f2-764948e95014',
        personId: '', 
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7', 
        createdAt: new Date(),
        deletedAt: null,
        displayName: 'Christoph',
        handle: 'incoming', // Keine Ahnung was genau das sein soll
        role: 'from', //muss gucken ob das passt
        updatedAt: new Date(),
      },
      {
        id: 'e716f5ba-c18c-4dd5-ac61-3315bc559e2d',
        messageId: '3939d68a-ac6b-4f86-87a2-5f5f9d1b6481',
        personId: '', 
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7', 
        createdAt: new Date(),
        deletedAt: null,
        displayName: '',
        handle: 'incoming',
        role: 'from',
        updatedAt: new Date(),
      },
      {
        id: '2afdc45d-9842-45b0-a87b-06589b7910b7',
        messageId: 'df85506a-6127-46bd-bcea-85db936b163d',
        personId: '', 
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7', 
        createdAt: new Date(),
        deletedAt: null,
        displayName: '',
        handle: 'incoming',
        role: 'from',
        updatedAt: new Date(),
      },
    ])
    .execute();
};

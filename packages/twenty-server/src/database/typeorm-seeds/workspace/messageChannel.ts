import { DataSource } from 'typeorm';

const tableName = 'messageChannel';

export const seedMessageChannel = async (
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
      'isContactAutoCreationEnabled',
      'type',
      'connectedAccountId',
      'handle',
      'visibility',
    ])
    .orIgnore()
    .values([
      {
        id: '815e647f-9b80-4c2c-a597-383db48de1d6',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: '6773281b-9ac0-4390-9a1a-ab4d2c4e1bb7', 
        handle: 'outgoing',
        visibility: 'share_everything',
      },
      {
        id: 'cc2a5b92-09ed-4eb9-8b23-62aa4fd81d83',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: '6773281b-9ac0-4390-9a1a-ab4d2c4e1bb7', 
        handle: 'incoming',
        visibility: 'share_everything',
      },
      {
        id: '756118c6-5ffe-4b32-814a-983d5e4911cd',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: '67373de8-0cc8-4d60-a3a4-803245698908', 
        handle: 'outgoing',
        visibility: 'share_everything',
      },
      {
        id: '24b91637-9dad-4329-8180-62647a2d7510',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: '67373de8-0cc8-4d60-a3a4-803245698908', 
        handle: 'incoming',
        visibility: 'share_everything',
      },
      {
        id: '3991bcbc-e2f1-49b5-85d2-5d3a3386990c',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: 'f2a8cf93-cafc-4323-908d-e5b42ad69fdf', 
        handle: 'outgoing',
        visibility: 'share_everything',
      },
      {
        id: '6cbf78c7-fdff-438f-9132-7d5f216dfc4d',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: 'f2a8cf93-cafc-4323-908d-e5b42ad69fdf', 
        handle: 'incoming',
        visibility: 'share_everything',
      },
    ])
    .execute();
};

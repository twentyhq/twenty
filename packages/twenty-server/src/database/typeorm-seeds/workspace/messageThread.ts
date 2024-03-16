import { DataSource } from 'typeorm';

const tableName = 'messageThread';

export const seedMessageThread = async (
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
    ])
    .orIgnore()
    .values([
      {
        id: 'f66b3db3-8bfa-453b-b99b-bc435a7d4da8',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'a05c4e4c-634a-4fde-aa7c-28a0eaf203ca',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: '8ed861c2-1b56-4f10-a2fa-2ccaddf81f6c',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: '5c28ed13-d51c-485a-b1b6-ed7c63e05d72',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ])
    .execute();
};

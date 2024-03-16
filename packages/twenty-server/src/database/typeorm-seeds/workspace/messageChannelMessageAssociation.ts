import { DataSource } from 'typeorm';

const tableName = 'messageChannelMessageAssociation';

export const seedMessageChannelMessageAssociation = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'createdAt',
      'deletedAt',
      'messageChannelId',
      'messageExternalId',
      'messageId',
      'messageThreadExternalId',
      'messageThreadId',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: '067fb2c8-cc69-44ef-a82c-600c0dbf39ba',
        createdAt: new Date(),
        deletedAt: null,
        messageChannelId: '815e647f-9b80-4c2c-a597-383db48de1d6',
        messageExternalId: null,
        messageId: '99ef24a8-2b8a-405d-8f42-e820ca921421',
        messageThreadExternalId: null,
        messageThreadId: 'f66b3db3-8bfa-453b-b99b-bc435a7d4da8',
        updatedAt: new Date(),
      },
      {
        id: '736e9516-d80e-4a13-b10b-72ba09082668',
        createdAt: new Date(),
        deletedAt: null,
        messageChannelId: '815e647f-9b80-4c2c-a597-383db48de1d6',
        messageExternalId: null,
        messageId: '8f804a9a-04c8-4f24-93f2-764948e95014',
        messageThreadExternalId: null,
        messageThreadId: 'a05c4e4c-634a-4fde-aa7c-28a0eaf203ca',
        updatedAt: new Date(),
      },
      {
        id: 'bb9a3fb8-e6ec-4c8a-b431-0901eaf395a9',
        createdAt: new Date(),
        deletedAt: null,
        messageChannelId: '815e647f-9b80-4c2c-a597-383db48de1d6',
        messageExternalId: null,
        messageId: '3939d68a-ac6b-4f86-87a2-5f5f9d1b6481',
        messageThreadExternalId: null,
        messageThreadId: 'f66b3db3-8bfa-453b-b99b-bc435a7d4da8',
        updatedAt: new Date(),
      },
    ])
    .execute();
};

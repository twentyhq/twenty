import { DataSource } from 'typeorm';

const tableName = 'pipelineStep';

export const seedPipelineStep = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'name', 'color', 'position'])
    .orIgnore()
    .values([
      {
        id: '6edf4ead-006a-46e1-9c6d-228f1d0143c9',
        name: 'New',
        color: 'red',
        position: 0,
      },
      {
        id: 'd8361722-03fb-4e65-bd4f-ec9e52e5ec0a',
        name: 'Screening',
        color: 'purple',
        position: 1,
      },
      {
        id: '30b14887-d592-427d-bd97-6e670158db02',
        name: 'Meeting',
        color: 'sky',
        position: 2,
      },
      {
        id: 'db5a6648-d80d-4020-af64-4817ab4a12e8',
        name: 'Proposal',
        color: 'turquoise',
        position: 3,
      },
      {
        id: 'bea8bb7b-5467-48a6-9a8a-a8fa500123fe',
        name: 'Customer',
        color: 'yellow',
        position: 4,
      },
    ])
    .execute();
};

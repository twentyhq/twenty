import { DataSource } from 'typeorm';

const tableName = 'company';

export const seedCompanies = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'domainName',
      'address',
      'position',
    ])
    .orIgnore()
    .values([
      {
        id: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
        name: 'ارتباطات هدی ارقام',
        domainName: 'hodaargham.com',
        address: '',
        position: 1,
      },
      {
        id: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
        name: 'رسانه مهر',
        domainName: 'mehrfcp.ir',
        address: '',
        position: 2,
      },
      {
        id: '04b2e9f5-0713-40a5-8216-82802401d33e',
        name: 'ضحی کیش',
        domainName: 'zohakish.ir',
        address: '',
        position: 3,
      },
      {
        id: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        name: 'راهپویان همتا',
        domainName: 'hamrahvas.com',
        address: '',
        position: 4,
      },
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        name: 'تالیا',
        domainName: 'taliya.ir',
        address: '',
        position: 5,
      },
    ])
    .execute();
};

import { EntityManager } from 'typeorm';

const tableName = 'company';

export const DEV_SEED_COMPANY_IDS = {
  LINKEDIN: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
  FACEBOOK: '20202020-5d81-46d6-bf83-f7fd33ea6102',
  QONTO: '20202020-0713-40a5-8216-82802401d33e',
  MICROSOFT: '20202020-ed89-413a-b31a-962986e67bb4',
  AIRBNB: '20202020-171e-4bcc-9cf7-43448d6fb278',
  GOOGLE: '20202020-c21e-4ec2-873b-de4264d89025',
  NETFLIX: '20202020-707e-44dc-a1d2-30030bf1a944',
  LIBEO: '20202020-3f74-492d-a101-2a70f50a1645',
  CLAAP: '20202020-cfbf-4156-a790-e39854dcd4eb',
  HASURA: '20202020-f86b-419f-b794-02319abe8637',
  WEWORK: '20202020-5518-4553-9433-42d8eb82834b',
  SAMSUNG: '20202020-f79e-40dd-bd06-c36e6abb4678',
  ALGOLIA: '20202020-1455-4c57-afaf-dd5dc086361d',
};

export const seedCompanies = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'domainName',
      'position',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_COMPANY_IDS.LINKEDIN,
        name: 'Linkedin',
        domainName: 'linkedin.com',
        position: 1,
      },
      {
        id: DEV_SEED_COMPANY_IDS.FACEBOOK,
        name: 'Facebook',
        domainName: 'facebook.com',
        position: 2,
      },
      {
        id: DEV_SEED_COMPANY_IDS.QONTO,
        name: 'Qonto',
        domainName: 'qonto.com',
        position: 3,
      },
      {
        id: DEV_SEED_COMPANY_IDS.MICROSOFT,
        name: 'Microsoft',
        domainName: 'microsoft.com',
        position: 4,
      },
      {
        id: DEV_SEED_COMPANY_IDS.AIRBNB,
        name: 'Airbnb',
        domainName: 'airbnb.com',
        position: 5,
      },
      {
        id: DEV_SEED_COMPANY_IDS.GOOGLE,
        name: 'Google',
        domainName: 'google.com',
        position: 6,
      },
      {
        id: DEV_SEED_COMPANY_IDS.NETFLIX,
        name: 'Netflix',
        domainName: 'netflix.com',
        position: 7,
      },
      {
        id: DEV_SEED_COMPANY_IDS.LIBEO,
        name: 'Libeo',
        domainName: 'libeo.io',
        position: 8,
      },
      {
        id: DEV_SEED_COMPANY_IDS.CLAAP,
        name: 'Claap',
        domainName: 'claap.io',
        position: 9,
      },
      {
        id: DEV_SEED_COMPANY_IDS.HASURA,
        name: 'Hasura',
        domainName: 'hasura.io',
        position: 10,
      },
      {
        id: DEV_SEED_COMPANY_IDS.WEWORK,
        name: 'Wework',
        domainName: 'wework.com',
        position: 11,
      },
      {
        id: DEV_SEED_COMPANY_IDS.SAMSUNG,
        name: 'Samsung',
        domainName: 'samsung.com',
        position: 12,
      },
      {
        id: DEV_SEED_COMPANY_IDS.ALGOLIA,
        name: 'Algolia',
        domainName: 'algolia.com',
        position: 13,
      },
    ])
    .execute();
};

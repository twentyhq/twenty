import { DataSource } from 'typeorm';

const tableName = 'onboardingPlans';

export const seedOnboardingPlans = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['title', 'price', 'type', 'features'])
    .orIgnore()
    .values([
      {
        title: 'Plan Start',
        price: 900,
        type: 'Prepaid',
        features: ['4 extensions', '2 simultaneous calls'],
      },
    ])
    .execute();
};

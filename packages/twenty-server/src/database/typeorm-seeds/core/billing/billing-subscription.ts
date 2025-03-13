import { DataSource } from 'typeorm';

const tableName = 'billingSubscription';

export const seedBillingSubscriptions = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'workspaceId',
      'stripeCustomerId',
      'stripeSubscriptionId',
      'status',
      'metadata',
    ])
    .orIgnore()
    .values([
      {
        workspaceId,
        stripeCustomerId: 'cus_default0',
        stripeSubscriptionId: 'sub_default0',
        status: 'active',
        metadata: {
          workspaceId,
        },
      },
    ])
    .execute();
};

import { DataSource } from 'typeorm';

const tableName = 'opportunity';

export const seedOpportunity = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'amountAmountMicros',
      'amountCurrencyCode',
      'closeDate',
      'probability',
      'pipelineStepId',
      'pointOfContactId',
      'personId',
      'companyId',
    ])
    .orIgnore()
    .values([
      {
        id: '7c887ee3-be10-412b-a663-16bd3c2228e1',
        amountAmountMicros: 100000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        probability: 0.5,
        pipelineStepId: '6edf4ead-006a-46e1-9c6d-228f1d0143c9',
        pointOfContactId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        personId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        companyId: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
      },
      {
        id: '53f66647-0543-4cc2-9f96-95cc699960f2',
        amountAmountMicros: 2000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        probability: 0.5,
        pipelineStepId: 'd8361722-03fb-4e65-bd4f-ec9e52e5ec0a',
        pointOfContactId: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
        personId: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
        companyId: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
      },
      {
        id: '81ab695d-2f89-406f-90ea-180f433b2445',
        amountAmountMicros: 300000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        probability: 0.5,
        pipelineStepId: '30b14887-d592-427d-bd97-6e670158db02',
        pointOfContactId: '9b324a88-6784-4449-afdf-dc62cb8702f2',
        personId: '9b324a88-6784-4449-afdf-dc62cb8702f2',
        companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
      },
      {
        id: '9b059852-35b1-4045-9cde-42f715148954',
        amountAmountMicros: 4000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        probability: 0.5,
        pipelineStepId: '30b14887-d592-427d-bd97-6e670158db02',
        pointOfContactId: '98406e26-80f1-4dff-b570-a74942528de3',
        personId: '98406e26-80f1-4dff-b570-a74942528de3',
        companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
      },
    ])
    .execute();
};

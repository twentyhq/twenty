import { EntityManager } from 'typeorm';

import { DEV_SEED_COMPANY_IDS } from 'src/database/typeorm-seeds/workspace/companies';
import { DEV_SEED_PERSON_IDS } from 'src/database/typeorm-seeds/workspace/seedPeople';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';

const tableName = 'opportunity';

export const DEV_SEED_OPPORTUNITY_IDS = {
  OPPORTUNITY_1: '20202020-be10-412b-a663-16bd3c2228e1',
  OPPORTUNITY_2: '20202020-0543-4cc2-9f96-95cc699960f2',
  OPPORTUNITY_3: '20202020-2f89-406f-90ea-180f433b2445',
  OPPORTUNITY_4: '20202020-35b1-4045-9cde-42f715148954',
};

export const seedOpportunity = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'amountAmountMicros',
      'amountCurrencyCode',
      'closeDate',
      'stage',
      'position',
      'pointOfContactId',
      'companyId',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_OPPORTUNITY_IDS.OPPORTUNITY_1,
        name: 'Opportunity 1',
        amountAmountMicros: 100000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        stage: 'NEW',
        position: 1,
        pointOfContactId: DEV_SEED_PERSON_IDS.CHRISTOPH,
        companyId: DEV_SEED_COMPANY_IDS.LINKEDIN,
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        createdByName: 'Tim Cook',
      },
      {
        id: DEV_SEED_OPPORTUNITY_IDS.OPPORTUNITY_2,
        name: 'Opportunity 2',
        amountAmountMicros: 2000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        stage: 'MEETING',
        position: 2,
        pointOfContactId: DEV_SEED_PERSON_IDS.CHRISTOPHER_G,
        companyId: DEV_SEED_COMPANY_IDS.FACEBOOK,
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        createdByName: 'Tim Cook',
      },
      {
        id: DEV_SEED_OPPORTUNITY_IDS.OPPORTUNITY_3,
        name: 'Opportunity 3',
        amountAmountMicros: 300000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        stage: 'PROPOSAL',
        position: 3,
        pointOfContactId: DEV_SEED_PERSON_IDS.NICHOLAS,
        companyId: DEV_SEED_COMPANY_IDS.MICROSOFT,
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        createdByName: 'Tim Cook',
      },
      {
        id: DEV_SEED_OPPORTUNITY_IDS.OPPORTUNITY_4,
        name: 'Opportunity 4',
        amountAmountMicros: 4000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        stage: 'PROPOSAL',
        position: 4,
        pointOfContactId: DEV_SEED_PERSON_IDS.MATTHEW,
        companyId: DEV_SEED_COMPANY_IDS.MICROSOFT,
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: null,
        createdByName: '',
      },
    ])
    .execute();
};

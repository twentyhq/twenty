import {
  type EventLogRecord,
  EventLogTable,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

type MockedLogicFunction = {
  id: string;
  name: string;
  applicationId: string;
};

const SYNC_STRIPE_INVOICES: MockedLogicFunction = {
  id: '71ca299e-0dd9-404b-a4d6-9624e0bb89bf',
  name: 'syncStripeInvoices',
  applicationId: 'ebd81a57-25ef-48cc-a53a-2e135c2a57e8',
};

const SCORE_INBOUND_LEAD: MockedLogicFunction = {
  id: '27671ffa-2a0a-493c-a902-f749892997c5',
  name: 'scoreInboundLead',
  applicationId: 'e4f70464-29d0-48bc-b633-d54b746afa31',
};

const ENRICH_COMPANY_FROM_DOMAIN: MockedLogicFunction = {
  id: '1e0fab1a-2ab7-4c6a-8b20-a18421126705',
  name: 'enrichCompanyFromDomain',
  applicationId: 'ab72cb06-98e5-4090-8b71-31a7eed337d9',
};

const SYNC_STRIPE_INVOICES_EXECUTION_ID =
  '88637fa4-e95f-4901-85f1-4227b6e3a1c2';

const AMOUNT_DUE_TYPE_ERROR = [
  "TypeError: Cannot read properties of undefined (reading 'amount_due')",
  '    at mapInvoiceToOpportunity (src/logic-functions/sync-stripe-invoices.ts:48:31)',
  '    at Array.map (<anonymous>)',
  '    at syncStripeInvoices (src/logic-functions/sync-stripe-invoices.ts:22:28)',
  '    at async executeLogicFunction (runtime/executor.js:112:18)',
].join('\n');

const buildApplicationLogRecord = ({
  timestamp,
  logicFunction,
  executionId,
  level,
  message,
}: {
  timestamp: string;
  logicFunction: MockedLogicFunction;
  executionId: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
}): EventLogRecord => ({
  __typename: 'EventLogRecord',
  event: logicFunction.name,
  timestamp,
  userId: null,
  recordId: null,
  objectMetadataId: null,
  properties: {
    level,
    message,
    executionId,
    logicFunctionId: logicFunction.id,
    applicationId: logicFunction.applicationId,
  },
});

const SARAH_CHEN_USER_ID = '7f49f132-56c7-4beb-8ea6-f336fe487c7d';

const MARC_DUBOIS_USER_ID = 'cefec196-1610-4e82-95db-99ed5856117b';

const SARAH_CHEN_ACTOR = {
  source: 'MANUAL',
  workspaceMemberId: 'dc0f5751-afb7-43de-86c1-8bd150934d5f',
  name: 'Sarah Chen',
  context: {},
};

const MARC_DUBOIS_ACTOR = {
  source: 'MANUAL',
  workspaceMemberId: '7112c4f4-d9c7-4eaf-b52f-84f2bd9c1b7c',
  name: 'Marc Dubois',
  context: {},
};

const ZAPIER_SYNC_API_KEY_ACTOR = {
  source: 'API',
  workspaceMemberId: null,
  name: 'Zapier sync',
  context: {},
};

const LUMEN_HEALTH_PILOT_BEFORE_UPDATE = {
  id: 'f46932b8-6725-4931-aa5b-ea0144bdb789',
  name: 'Lumen Health - Pilot',
  stage: 'PROPOSAL',
  amount: { amountMicros: 40000000000, currencyCode: 'USD' },
  closeDate: '2026-10-15T10:00:00.000Z',
  updatedBy: SARAH_CHEN_ACTOR,
};

const OAKRIDGE_FOODS_BEFORE_UPDATE = {
  id: 'fcb75a6e-dfb7-42d7-b9e4-7d9adfded812',
  name: 'Oakridge Foods',
  employees: 120,
  updatedBy: ZAPIER_SYNC_API_KEY_ACTOR,
};

const ETHAN_BROOKS_AFTER_CREATION = {
  id: 'c23a80e6-92eb-40d5-8994-87d0b0298573',
  name: { firstName: 'Ethan', lastName: 'Brooks' },
  jobTitle: 'VP Marketing',
  city: 'Paris',
  createdBy: MARC_DUBOIS_ACTOR,
  updatedBy: MARC_DUBOIS_ACTOR,
};

export const mockedEventLogRecordsByTable: Partial<
  Record<EventLogTable, EventLogRecord[]>
> = {
  [EventLogTable.OBJECT_EVENT]: [
    {
      __typename: 'EventLogRecord',
      event: 'Object Record Updated',
      timestamp: '2026-09-24T11:57:48.203Z',
      userId: SARAH_CHEN_USER_ID,
      recordId: LUMEN_HEALTH_PILOT_BEFORE_UPDATE.id,
      objectMetadataId: getMockObjectMetadataItemOrThrow('opportunity').id,
      properties: {
        before: LUMEN_HEALTH_PILOT_BEFORE_UPDATE,
        after: {
          ...LUMEN_HEALTH_PILOT_BEFORE_UPDATE,
          stage: 'CUSTOMER',
          amount: { amountMicros: 52000000000, currencyCode: 'USD' },
          closeDate: '2026-09-24T10:00:00.000Z',
        },
        updatedFields: ['stage', 'amount', 'closeDate'],
        diff: {
          stage: { before: 'PROPOSAL', after: 'CUSTOMER' },
          amount: {
            before: { amountMicros: 40000000000, currencyCode: 'USD' },
            after: { amountMicros: 52000000000, currencyCode: 'USD' },
          },
          closeDate: {
            before: '2026-10-15T10:00:00.000Z',
            after: '2026-09-24T10:00:00.000Z',
          },
        },
      },
    },
    {
      __typename: 'EventLogRecord',
      event: 'Object Record Updated',
      timestamp: '2026-09-24T11:45:58.561Z',
      userId: null,
      recordId: OAKRIDGE_FOODS_BEFORE_UPDATE.id,
      objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
      properties: {
        before: OAKRIDGE_FOODS_BEFORE_UPDATE,
        after: { ...OAKRIDGE_FOODS_BEFORE_UPDATE, employees: 135 },
        updatedFields: ['employees'],
        diff: { employees: { before: 120, after: 135 } },
      },
    },
    {
      __typename: 'EventLogRecord',
      event: 'Object Record Created',
      timestamp: '2026-09-24T11:30:12.004Z',
      userId: MARC_DUBOIS_USER_ID,
      recordId: ETHAN_BROOKS_AFTER_CREATION.id,
      objectMetadataId: getMockObjectMetadataItemOrThrow('person').id,
      properties: { after: ETHAN_BROOKS_AFTER_CREATION },
    },
  ],
  [EventLogTable.APPLICATION_LOG]: [
    buildApplicationLogRecord({
      timestamp: '2026-09-24T12:02:43.803Z',
      logicFunction: SCORE_INBOUND_LEAD,
      executionId: '4f250a20-1e82-4486-9927-fe74a125b711',
      level: 'WARN',
      message:
        'Missing job title for Omar Aziz, using default title score (20)',
    }),
    buildApplicationLogRecord({
      timestamp: '2026-09-24T12:00:07.684Z',
      logicFunction: SYNC_STRIPE_INVOICES,
      executionId: SYNC_STRIPE_INVOICES_EXECUTION_ID,
      level: 'ERROR',
      message: 'Sync failed: 9 of 9 invoices could not be mapped',
    }),
    buildApplicationLogRecord({
      timestamp: '2026-09-24T12:00:07.555Z',
      logicFunction: SYNC_STRIPE_INVOICES,
      executionId: SYNC_STRIPE_INVOICES_EXECUTION_ID,
      level: 'ERROR',
      message: AMOUNT_DUE_TYPE_ERROR,
    }),
    buildApplicationLogRecord({
      timestamp: '2026-09-24T12:00:07.531Z',
      logicFunction: SYNC_STRIPE_INVOICES,
      executionId: SYNC_STRIPE_INVOICES_EXECUTION_ID,
      level: 'DEBUG',
      message:
        'Mapping invoice in_RfzDyZNf6gC6sZ (customer cus_WaekE07TFgyg5r)',
    }),
    buildApplicationLogRecord({
      timestamp: '2026-09-24T12:00:07.523Z',
      logicFunction: SYNC_STRIPE_INVOICES,
      executionId: SYNC_STRIPE_INVOICES_EXECUTION_ID,
      level: 'INFO',
      message: 'Received 9 invoices from Stripe',
    }),
    buildApplicationLogRecord({
      timestamp: '2026-09-24T12:00:07.141Z',
      logicFunction: SYNC_STRIPE_INVOICES,
      executionId: SYNC_STRIPE_INVOICES_EXECUTION_ID,
      level: 'INFO',
      message: 'Fetching invoices updated since 2026-09-24T11:55:00Z',
    }),
    buildApplicationLogRecord({
      timestamp: '2026-09-24T11:58:55.010Z',
      logicFunction: ENRICH_COMPANY_FROM_DOMAIN,
      executionId: 'f24ef7d8-b678-4eea-88bd-3301a8722bb0',
      level: 'INFO',
      message: 'Fetched firmographics for halcyon-robotics.com in 819 ms',
    }),
  ],
};

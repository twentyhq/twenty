import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
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

const SARAH_CHEN: PartialWorkspaceMember = {
  id: 'dc0f5751-afb7-43de-86c1-8bd150934d5f',
  userId: '7f49f132-56c7-4beb-8ea6-f336fe487c7d',
  userWorkspaceId: '13b99c62-ed19-402a-b341-e5e3c5f818c0',
  name: { firstName: 'Sarah', lastName: 'Chen' },
  userEmail: 'sarah.chen@acme.com',
};

const MARC_DUBOIS: PartialWorkspaceMember = {
  id: '7112c4f4-d9c7-4eaf-b52f-84f2bd9c1b7c',
  userId: 'cefec196-1610-4e82-95db-99ed5856117b',
  userWorkspaceId: '76a92f7c-4d6f-451c-890f-b94a65ccda58',
  name: { firstName: 'Marc', lastName: 'Dubois' },
  userEmail: 'marc.dubois@acme.com',
};

const PRIYA_NAIR: PartialWorkspaceMember = {
  id: '0ff394ad-264b-4761-a583-f1d74ef00e3d',
  userId: 'f5dc04b7-90b8-46e9-82bb-4d9798fe6588',
  userWorkspaceId: 'd7d9c043-9e04-4210-ad58-3208f322b833',
  name: { firstName: 'Priya', lastName: 'Nair' },
  userEmail: 'priya.nair@acme.com',
};

const JONAS_WEBER: PartialWorkspaceMember = {
  id: '927db2a7-dd99-4004-8cd5-b9ff216c0a0b',
  userId: 'e64aa8bd-6a2d-4348-993f-0b0328e5f5ec',
  userWorkspaceId: '3a6e65ea-f0a6-482d-bded-40d81e1bb92b',
  name: { firstName: 'Jonas', lastName: 'Weber' },
  userEmail: 'jonas.weber@acme.com',
};

export const mockedEventLogWorkspaceMembers: PartialWorkspaceMember[] = [
  SARAH_CHEN,
  MARC_DUBOIS,
  PRIYA_NAIR,
  JONAS_WEBER,
];

const SARAH_CHEN_ACTOR = {
  source: 'MANUAL',
  workspaceMemberId: SARAH_CHEN.id,
  name: 'Sarah Chen',
  context: {},
};

const MARC_DUBOIS_ACTOR = {
  source: 'MANUAL',
  workspaceMemberId: MARC_DUBOIS.id,
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

const CHROME_ON_MAC_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

export const mockedEventLogRecordsByTable: Partial<
  Record<EventLogTable, EventLogRecord[]>
> = {
  [EventLogTable.OBJECT_EVENT]: [
    {
      __typename: 'EventLogRecord',
      event: 'Object Record Updated',
      timestamp: '2026-09-24T11:57:48.203Z',
      userId: SARAH_CHEN.userId,
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
      userId: MARC_DUBOIS.userId,
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
  [EventLogTable.PAGEVIEW]: [
    {
      __typename: 'EventLogRecord',
      event: 'Twenty',
      timestamp: '2026-09-24T11:59:02.114Z',
      userId: PRIYA_NAIR.userId,
      recordId: null,
      objectMetadataId: null,
      properties: {
        href: 'https://acme.twenty.com/objects/opportunities',
        pathname: '/objects/opportunities',
        sessionId: '000aec5a-6c6c-4d91-aac9-a52397b439e2',
        locale: 'en-US',
        userAgent: CHROME_ON_MAC_USER_AGENT,
      },
    },
    {
      __typename: 'EventLogRecord',
      event: 'Twenty',
      timestamp: '2026-09-24T11:52:40.870Z',
      userId: SARAH_CHEN.userId,
      recordId: null,
      objectMetadataId: null,
      properties: {
        href: `https://acme.twenty.com/object/company/${OAKRIDGE_FOODS_BEFORE_UPDATE.id}`,
        pathname: `/object/company/${OAKRIDGE_FOODS_BEFORE_UPDATE.id}`,
        sessionId: 'fe8766d8-3323-44ac-ad66-42d2d3dcda9b',
        locale: 'fr-FR',
        userAgent: CHROME_ON_MAC_USER_AGENT,
      },
    },
  ],
  [EventLogTable.USAGE_EVENT]: [
    {
      __typename: 'EventLogRecord',
      event: 'AI',
      timestamp: '2026-09-24T11:56:21.408Z',
      userId: JONAS_WEBER.userWorkspaceId,
      recordId: null,
      objectMetadataId: null,
      properties: {
        operationType: 'AI_CHAT_TOKEN',
        quantity: 1320,
        unit: 'TOKEN',
        creditsUsedMicro: 5500,
        resourceId: '',
        resourceContext: 'anthropic/claude-opus-4-6',
      },
    },
    {
      __typename: 'EventLogRecord',
      event: 'WORKFLOW',
      timestamp: '2026-09-24T11:41:09.772Z',
      userId: SARAH_CHEN.userWorkspaceId,
      recordId: null,
      objectMetadataId: null,
      properties: {
        operationType: 'WORKFLOW_EXECUTION',
        quantity: 1,
        unit: 'INVOCATION',
        creditsUsedMicro: 12000,
        resourceId: '',
        resourceContext: '',
      },
    },
  ],
};

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

const MAPLE_CONSULTING = {
  id: 'e0c49b77-894b-449b-9c31-6bfcff73a0e5',
  name: 'Maple Consulting Inc.',
  employees: 2383,
  annualRecurringRevenue: { amountMicros: 88000000000, currencyCode: 'USD' },
};

const KEYSTONE_RETAIL = {
  id: '6b1f5a7e-3c1d-4f0e-9d8a-2e4b7c9a1f03',
  name: 'Keystone Retail LLC',
  employees: 640,
};

const BEACON_FREIGHT = {
  id: '9d2c8e4a-7b6f-4a1e-8c3d-5f0b2a6e7d19',
  name: 'Beacon Freight GmbH',
  employees: 1150,
};

const PURGED_COMPANY_ID = '3f8a2c1d-5e7b-4d9a-b6c0-8e1f4a2d7c55';

const BULK_DELETE_TIMESTAMP = '2026-09-24T09:42:30.903Z';

const buildCompanyDeletionRecord = ({
  timestamp,
  company,
}: {
  timestamp: string;
  company: { id: string };
}): EventLogRecord => ({
  __typename: 'EventLogRecord',
  event: 'Object Record Deleted',
  timestamp,
  userId: MARC_DUBOIS.userId,
  recordId: company.id,
  objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
  properties: {
    before: { ...company, deletedAt: null },
    after: { ...company, deletedAt: timestamp },
    updatedFields: ['deletedAt'],
    diff: { deletedAt: { before: null, after: timestamp } },
  },
});

const CHROME_ON_MAC_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const SUPPORT_TEAM_USER_ID = '54277312-cdf2-4cb5-be40-ca7c49aa1293';

const buildWorkspaceEventRecord = ({
  event,
  timestamp,
  userId = null,
  properties,
}: {
  event: string;
  timestamp: string;
  userId?: string | null;
  properties: Record<string, unknown>;
}): EventLogRecord => ({
  __typename: 'EventLogRecord',
  event,
  timestamp,
  userId,
  recordId: null,
  objectMetadataId: null,
  properties,
});

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
    {
      __typename: 'EventLogRecord',
      event: 'Object Record Restored',
      timestamp: '2026-09-24T10:05:17.482Z',
      userId: PRIYA_NAIR.userId,
      recordId: KEYSTONE_RETAIL.id,
      objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
      properties: {
        before: { ...KEYSTONE_RETAIL, deletedAt: BULK_DELETE_TIMESTAMP },
        after: { ...KEYSTONE_RETAIL, deletedAt: null },
        updatedFields: ['deletedAt'],
        diff: { deletedAt: { before: BULK_DELETE_TIMESTAMP, after: null } },
      },
    },
    buildCompanyDeletionRecord({
      timestamp: '2026-09-24T09:42:31.096Z',
      company: MAPLE_CONSULTING,
    }),
    buildCompanyDeletionRecord({
      timestamp: BULK_DELETE_TIMESTAMP,
      company: KEYSTONE_RETAIL,
    }),
    buildCompanyDeletionRecord({
      timestamp: BULK_DELETE_TIMESTAMP,
      company: BEACON_FREIGHT,
    }),
    {
      __typename: 'EventLogRecord',
      event: 'Object Record Destroyed',
      timestamp: '2026-09-24T02:00:04.117Z',
      userId: null,
      recordId: PURGED_COMPANY_ID,
      objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
      properties: {
        recordId: PURGED_COMPANY_ID,
        objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
      },
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
  [EventLogTable.WORKSPACE_EVENT]: [
    buildWorkspaceEventRecord({
      event: 'Webhook Response',
      timestamp: '2026-09-24T12:02:54.034Z',
      properties: {
        status: 200,
        success: true,
        url: 'https://hooks.zapier.com/hooks/catch/1284551/b7kq2x/',
        webhookId: 'b9a726ce-3d8a-45b2-bb73-22f5b008afca',
        eventName: 'opportunity.updated',
      },
    }),
    buildWorkspaceEventRecord({
      event: 'AuthSession',
      timestamp: '2026-09-24T11:47:34.761Z',
      userId: PRIYA_NAIR.userId,
      properties: {
        action: 'user_signed_in',
        message:
          'sessionId=b3077ad7-7730-471f-aa15-741670e55781; authProvider=google',
      },
    }),
    buildWorkspaceEventRecord({
      event: 'Impersonation',
      timestamp: '2026-09-24T10:48:52.901Z',
      userId: SUPPORT_TEAM_USER_ID,
      properties: {
        level: 'workspace',
        action: 'ended',
        message:
          'Impersonation ended by impersonatorUserWorkspaceId=6ce5e52e-604a-4256-8557-11be219a6436; workspaceId=142932b1-197e-490a-9d49-9e84ac8f15c1',
      },
    }),
    buildWorkspaceEventRecord({
      event: 'Impersonation',
      timestamp: '2026-09-24T10:31:05.377Z',
      userId: SUPPORT_TEAM_USER_ID,
      properties: {
        level: 'server',
        action: 'token_exchange_success',
        message: `Impersonation token exchanged for ${PRIYA_NAIR.userEmail} by userId ${SUPPORT_TEAM_USER_ID}`,
      },
    }),
    buildWorkspaceEventRecord({
      event: 'Impersonation',
      timestamp: '2026-09-24T10:30:40.012Z',
      userId: SUPPORT_TEAM_USER_ID,
      properties: {
        level: 'server',
        action: 'token_exchange_failed',
        message: `Server level impersonation denied (2FA verification required) for ${PRIYA_NAIR.userEmail} by userId ${SUPPORT_TEAM_USER_ID}`,
      },
    }),
    buildWorkspaceEventRecord({
      event: 'AuthSession',
      timestamp: '2026-09-24T08:02:14.604Z',
      userId: SARAH_CHEN.userId,
      properties: {
        action: 'session_revoked',
        message:
          'sessionId=e1290762-81d6-431b-bb1b-3ecae9015524; authProvider=google',
      },
    }),
    buildWorkspaceEventRecord({
      event: 'Webhook Response',
      timestamp: '2026-09-24T07:25:09.302Z',
      properties: {
        status: 503,
        success: false,
        url: 'https://ingest.northwind-data.io/v1/twenty',
        webhookId: 'f67afe3e-110d-4d48-856d-cf2fc9e60eff',
        eventName: 'person.created',
      },
    }),
    buildWorkspaceEventRecord({
      event: 'Webhook Response',
      timestamp: '2026-09-24T06:10:40.500Z',
      properties: {
        success: false,
        url: 'https://n8n.acme.io/webhook/people-enrich',
        webhookId: 'b98afda0-c63a-497a-a02d-f3c722180be7',
        eventName: 'person.created',
      },
    }),
    buildWorkspaceEventRecord({
      event: 'Webhook Response',
      timestamp: '2026-09-24T05:31:18.227Z',
      properties: {
        success: false,
        url: 'https://crm-sync.acme.internal/hooks/twenty',
        webhookId: '68685c9a-6393-47a3-b01d-a693fe5f26ea',
        eventName: 'company.updated',
        error: 'Webhook URL resolves to a private/internal IP address',
      },
    }),
    buildWorkspaceEventRecord({
      event: 'User Signup',
      timestamp: '2026-09-23T13:20:03.055Z',
      userId: JONAS_WEBER.userId,
      properties: {},
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

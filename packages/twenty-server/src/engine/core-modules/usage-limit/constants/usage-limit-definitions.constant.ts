import { type UsageLimitDefinitionsByResourceType } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const USAGE_LIMIT_DEFINITIONS = {
  [UsageResourceType.API]: {
    speed: {
      allowedOperationTypes: [UsageOperationType.API_REQUEST],
      allowedSpenderTypes: ['apiKey', 'application'],
      defaults: [
        {
          resourceType: UsageResourceType.API,
          operationType: UsageOperationType.API_REQUEST,
          limitKind: 'speed',
          spenderType: 'apiKey',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable: 'API_RATE_LIMITING_SHORT_TTL_IN_MS',
          limitValueConfigVariable: 'API_RATE_LIMITING_SHORT_LIMIT',
          counterScope: 'perWorkspace',
          isOverridable: false,
        },
        {
          resourceType: UsageResourceType.API,
          operationType: UsageOperationType.API_REQUEST,
          limitKind: 'speed',
          spenderType: 'apiKey',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable: 'API_RATE_LIMITING_LONG_TTL_IN_MS',
          limitValueConfigVariable: 'API_RATE_LIMITING_LONG_LIMIT',
          counterScope: 'perWorkspace',
          isOverridable: true,
        },
        {
          resourceType: UsageResourceType.API,
          operationType: UsageOperationType.API_REQUEST,
          limitKind: 'speed',
          spenderType: 'application',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable: 'APPLICATION_API_RATE_LIMITING_TTL_IN_MS',
          limitValueConfigVariable: 'APPLICATION_API_RATE_LIMITING_LIMIT',
          counterScope: 'crossWorkspace',
          isOverridable: false,
        },
      ],
    },
  },
  [UsageResourceType.AI]: {
    quota: {
      allowedOperationTypes: [
        UsageOperationType.AI_CHAT_TOKEN,
        UsageOperationType.AI_WORKFLOW_TOKEN,
        UsageOperationType.WEB_SEARCH,
      ],
      allowedSpenderTypes: [
        'workspace',
        'userWorkspace',
        'apiKey',
        'application',
      ],
      allowedMeters: ['creditsUsedMicro', 'quantity'],
      defaults: [],
    },
  },
  [UsageResourceType.WORKFLOW]: {
    quota: {
      allowedOperationTypes: [UsageOperationType.WORKFLOW_EXECUTION],
      allowedSpenderTypes: ['workspace', 'application'],
      allowedMeters: ['creditsUsedMicro', 'quantity'],
      defaults: [],
    },
  },
  [UsageResourceType.APP]: {},
  [UsageResourceType.STORAGE]: {
    stock: {
      allowedOperationTypes: [UsageOperationType.STORAGE_FILE],
      allowedSpenderTypes: ['workspace', 'application'],
      allowedMeters: ['bytes', 'quantity'],
      defaults: [
        {
          resourceType: UsageResourceType.STORAGE,
          operationType: UsageOperationType.STORAGE_FILE,
          limitKind: 'stock',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'bytes',
          periodUnit: 'lifetime',
          periodCount: 1,
          limitValueConfigVariable: 'WORKSPACE_STORAGE_LIMIT_BYTES',
          isOverridable: true,
        },
      ],
    },
  },
  [UsageResourceType.LOGIC_FUNCTION]: {
    quota: {
      allowedOperationTypes: [UsageOperationType.CODE_EXECUTION],
      allowedSpenderTypes: ['workspace', 'application', 'logicFunction'],
      allowedMeters: ['creditsUsedMicro', 'quantity'],
      defaults: [],
    },
  },
  [UsageResourceType.EMAIL]: {
    speed: {
      allowedOperationTypes: [
        UsageOperationType.EMAIL_SEND,
        UsageOperationType.MESSAGE_CAMPAIGN_SEND,
      ],
      allowedSpenderTypes: ['workspace'],
      // Two buckets, and a send has to fit both. The workspace one keeps a
      // single tenant's campaign from spending the whole instance budget; the
      // server-wide one is what actually protects the provider account. The
      // narrower scope is declared first so it names the scope when a refusal
      // reports which limit was hit.
      defaults: [
        {
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.EMAIL_SEND,
          limitKind: 'speed',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable:
            'EMAIL_SEND_WORKSPACE_RATE_LIMITING_TTL_IN_MS',
          limitValueConfigVariable: 'EMAIL_SEND_WORKSPACE_RATE_LIMITING_LIMIT',
          counterScope: 'perWorkspace',
          isOverridable: true,
        },
        {
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.EMAIL_SEND,
          limitKind: 'speed',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable: 'EMAIL_SEND_RATE_LIMITING_TTL_IN_MS',
          limitValueConfigVariable: 'EMAIL_SEND_RATE_LIMITING_LIMIT',
          counterScope: 'crossWorkspace',
          isOverridable: false,
        },
        {
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.MESSAGE_CAMPAIGN_SEND,
          limitKind: 'speed',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable:
            'EMAIL_SEND_WORKSPACE_RATE_LIMITING_TTL_IN_MS',
          limitValueConfigVariable: 'EMAIL_SEND_WORKSPACE_RATE_LIMITING_LIMIT',
          counterScope: 'perWorkspace',
          isOverridable: true,
        },
        {
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.MESSAGE_CAMPAIGN_SEND,
          limitKind: 'speed',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable: 'EMAIL_SEND_RATE_LIMITING_TTL_IN_MS',
          limitValueConfigVariable: 'EMAIL_SEND_RATE_LIMITING_LIMIT',
          counterScope: 'crossWorkspace',
          isOverridable: false,
        },
      ],
    },
    quota: {
      allowedOperationTypes: [UsageOperationType.EMAIL_SEND],
      allowedSpenderTypes: ['workspace', 'userWorkspace'],
      allowedMeters: ['creditsUsedMicro', 'quantity'],
      defaults: [
        {
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.EMAIL_SEND,
          limitKind: 'quota',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'day',
          periodCount: 1,
          limitValueConfigVariable: 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT',
          isOverridable: true,
        },
      ],
    },
  },
  [UsageResourceType.WEBHOOK]: {
    speed: {
      allowedOperationTypes: [UsageOperationType.WEBHOOK_CALL],
      allowedSpenderTypes: ['workspace'],
      defaults: [
        {
          resourceType: UsageResourceType.WEBHOOK,
          operationType: UsageOperationType.WEBHOOK_CALL,
          limitKind: 'speed',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'second',
          windowMsConfigVariable: 'WEBHOOK_CALL_RATE_LIMITING_TTL_IN_MS',
          limitValueConfigVariable: 'WEBHOOK_CALL_RATE_LIMITING_LIMIT',
          counterScope: 'perWorkspace',
          isOverridable: true,
        },
      ],
    },
  },
  [UsageResourceType.RECORD]: {
    stock: {
      allowedOperationTypes: [UsageOperationType.RECORD_WRITE],
      allowedSpenderTypes: ['workspace'],
      allowedMeters: ['quantity'],
      defaults: [
        {
          resourceType: UsageResourceType.RECORD,
          operationType: UsageOperationType.RECORD_WRITE,
          limitKind: 'stock',
          spenderType: 'workspace',
          spenderId: '',
          meter: 'quantity',
          periodUnit: 'lifetime',
          periodCount: 1,
          limitValueConfigVariable: 'WORKSPACE_RECORD_LIMIT',
          isOverridable: true,
        },
      ],
    },
  },
} satisfies UsageLimitDefinitionsByResourceType;

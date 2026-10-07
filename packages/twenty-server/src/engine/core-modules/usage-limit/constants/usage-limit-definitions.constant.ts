import { type UsageLimitDefinitionsByResourceType } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const USAGE_LIMIT_DEFINITIONS = {
  [UsageResourceType.API]: {
    speed: {
      allowedOperations: [
        {
          operationType: UsageOperationType.API_REQUEST,
          allowedUnits: [UsageUnit.REQUEST],
        },
      ],
      allowedSpenderTypes: ['apiKey', 'application'],
      defaults: [
        {
          resourceType: UsageResourceType.API,
          operationType: UsageOperationType.API_REQUEST,
          limitKind: 'speed',
          spenderType: 'apiKey',
          spenderId: '',
          unit: UsageUnit.REQUEST,
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
          unit: UsageUnit.REQUEST,
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
          unit: UsageUnit.REQUEST,
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
      allowedOperations: [
        {
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.TOKEN],
        },
        {
          operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.TOKEN],
        },
        {
          operationType: UsageOperationType.WEB_SEARCH,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: [
        'workspace',
        'userWorkspace',
        'apiKey',
        'application',
      ],
      defaults: [
        {
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          limitKind: 'quota',
          spenderType: 'workspace',
          spenderId: '',
          unit: UsageUnit.CREDIT,
          periodUnit: 'day',
          periodCount: 1,
          limitValueConfigVariable:
            'AI_CHAT_INCLUDED_WORKSPACE_DAILY_CREDIT_LIMIT',
          trialLimitValueConfigVariable:
            'AI_CHAT_INCLUDED_TRIAL_WORKSPACE_DAILY_CREDIT_LIMIT',
          isOverridable: true,
        },
      ],
    },
  },
  [UsageResourceType.WORKFLOW]: {
    quota: {
      allowedOperations: [
        {
          operationType: UsageOperationType.WORKFLOW_EXECUTION,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'application'],
      defaults: [],
    },
  },
  [UsageResourceType.APP]: {},
  [UsageResourceType.STORAGE]: {
    stock: {
      allowedOperations: [
        {
          operationType: UsageOperationType.STORAGE_FILE,
          allowedUnits: [UsageUnit.BYTE, UsageUnit.FILE],
        },
      ],
      allowedSpenderTypes: ['workspace', 'application'],
      defaults: [
        {
          resourceType: UsageResourceType.STORAGE,
          operationType: UsageOperationType.STORAGE_FILE,
          limitKind: 'stock',
          spenderType: 'workspace',
          spenderId: '',
          unit: UsageUnit.BYTE,
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
      allowedOperations: [
        {
          operationType: UsageOperationType.CODE_EXECUTION,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'application', 'logicFunction'],
      defaults: [],
    },
  },
  [UsageResourceType.EMAIL]: {
    speed: {
      allowedOperations: [
        {
          operationType: UsageOperationType.EMAIL_SEND,
          allowedUnits: [UsageUnit.INVOCATION],
        },
        {
          operationType: UsageOperationType.MESSAGE_CAMPAIGN_SEND,
          allowedUnits: [UsageUnit.INVOCATION],
        },
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
          unit: UsageUnit.INVOCATION,
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
          unit: UsageUnit.INVOCATION,
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
          unit: UsageUnit.INVOCATION,
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
          unit: UsageUnit.INVOCATION,
          periodUnit: 'second',
          windowMsConfigVariable: 'EMAIL_SEND_RATE_LIMITING_TTL_IN_MS',
          limitValueConfigVariable: 'EMAIL_SEND_RATE_LIMITING_LIMIT',
          counterScope: 'crossWorkspace',
          isOverridable: false,
        },
      ],
    },
    quota: {
      allowedOperations: [
        {
          operationType: UsageOperationType.EMAIL_SEND,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'userWorkspace'],
      defaults: [
        {
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.EMAIL_SEND,
          limitKind: 'quota',
          spenderType: 'workspace',
          spenderId: '',
          unit: UsageUnit.INVOCATION,
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
      allowedOperations: [
        {
          operationType: UsageOperationType.WEBHOOK_CALL,
          allowedUnits: [UsageUnit.REQUEST],
        },
      ],
      allowedSpenderTypes: ['workspace'],
      defaults: [
        {
          resourceType: UsageResourceType.WEBHOOK,
          operationType: UsageOperationType.WEBHOOK_CALL,
          limitKind: 'speed',
          spenderType: 'workspace',
          spenderId: '',
          unit: UsageUnit.REQUEST,
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
      allowedOperations: [
        {
          operationType: UsageOperationType.RECORD_WRITE,
          allowedUnits: [UsageUnit.RECORD],
        },
      ],
      allowedSpenderTypes: ['workspace'],
      defaults: [
        {
          resourceType: UsageResourceType.RECORD,
          operationType: UsageOperationType.RECORD_WRITE,
          limitKind: 'stock',
          spenderType: 'workspace',
          spenderId: '',
          unit: UsageUnit.RECORD,
          periodUnit: 'lifetime',
          periodCount: 1,
          limitValueConfigVariable: 'WORKSPACE_RECORD_LIMIT',
          isOverridable: true,
        },
      ],
    },
  },
} satisfies UsageLimitDefinitionsByResourceType;

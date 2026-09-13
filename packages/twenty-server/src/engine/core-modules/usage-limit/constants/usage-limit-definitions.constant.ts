import { type UsageLimitDefinitions } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const USAGE_LIMIT_DEFINITIONS: Record<
  UsageResourceType,
  UsageLimitDefinitions
> = {
  [UsageResourceType.API]: {
    speed: {
      allowedOperationTypes: [UsageOperationType.API_REQUEST],
      allowedSpenderTypes: ['apiKey', 'application'],
      defaults: [
        {
          spenderType: 'apiKey',
          counterScope: 'perWorkspace',
          limitValueConfigVariable: 'API_RATE_LIMITING_SHORT_LIMIT',
          windowMsConfigVariable: 'API_RATE_LIMITING_SHORT_TTL_IN_MS',
          isOverridable: true,
        },
        {
          spenderType: 'apiKey',
          counterScope: 'perWorkspace',
          limitValueConfigVariable: 'API_RATE_LIMITING_LONG_LIMIT',
          windowMsConfigVariable: 'API_RATE_LIMITING_LONG_TTL_IN_MS',
          isOverridable: true,
        },
        {
          spenderType: 'application',
          counterScope: 'crossWorkspace',
          limitValueConfigVariable: 'APPLICATION_API_RATE_LIMITING_LIMIT',
          windowMsConfigVariable: 'APPLICATION_API_RATE_LIMITING_TTL_IN_MS',
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
        'agent',
      ],
      allowedMeters: ['creditsUsedMicro', 'quantity'],
    },
  },
  [UsageResourceType.WORKFLOW]: {},
  [UsageResourceType.APP]: {},
  [UsageResourceType.STORAGE]: {},
  [UsageResourceType.LOGIC_FUNCTION]: {},
  [UsageResourceType.EMAIL]: {
    speed: {
      allowedOperationTypes: [UsageOperationType.EMAIL_SEND],
      allowedSpenderTypes: ['workspace'],
      // Two buckets, and a send has to fit both. The workspace one keeps a
      // single tenant's campaign from spending the whole instance budget; the
      // server-wide one is what actually protects the provider account. The
      // narrower scope is declared first so it names the scope when a refusal
      // reports which limit was hit.
      defaults: [
        {
          spenderType: 'workspace',
          counterScope: 'perWorkspace',
          limitValueConfigVariable: 'EMAIL_SEND_WORKSPACE_RATE_LIMITING_LIMIT',
          windowMsConfigVariable:
            'EMAIL_SEND_WORKSPACE_RATE_LIMITING_TTL_IN_MS',
          isOverridable: true,
        },
        {
          spenderType: 'workspace',
          counterScope: 'crossWorkspace',
          limitValueConfigVariable: 'EMAIL_SEND_RATE_LIMITING_LIMIT',
          windowMsConfigVariable: 'EMAIL_SEND_RATE_LIMITING_TTL_IN_MS',
          isOverridable: false,
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
          spenderType: 'workspace',
          counterScope: 'perWorkspace',
          limitValueConfigVariable: 'WEBHOOK_CALL_RATE_LIMITING_LIMIT',
          windowMsConfigVariable: 'WEBHOOK_CALL_RATE_LIMITING_TTL_IN_MS',
          isOverridable: true,
        },
      ],
    },
  },
};

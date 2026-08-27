import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type UsageLimitDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const USAGE_LIMIT_DEFINITIONS: Record<
  UsageResourceType,
  Partial<Record<LimitKind, UsageLimitDefinition>>
> = {
  [UsageResourceType.API]: {
    speed: {
      allowedOperationTypes: [UsageOperationType.API_REQUEST],
      allowedSpenderTypes: ['workspace', 'apiKey', 'application'],
      fallbacks: [
        {
          spenderType: 'workspace',
          counterScope: 'perWorkspace',
          maxTokensConfigVariable: 'API_RATE_LIMITING_SHORT_LIMIT',
          windowMsConfigVariable: 'API_RATE_LIMITING_SHORT_TTL_IN_MS',
        },
        {
          spenderType: 'workspace',
          counterScope: 'perWorkspace',
          maxTokensConfigVariable: 'API_RATE_LIMITING_LONG_LIMIT',
          windowMsConfigVariable: 'API_RATE_LIMITING_LONG_TTL_IN_MS',
        },
        {
          spenderType: 'application',
          counterScope: 'crossWorkspace',
          maxTokensConfigVariable: 'APPLICATION_API_RATE_LIMITING_LIMIT',
          windowMsConfigVariable: 'APPLICATION_API_RATE_LIMITING_TTL_IN_MS',
        },
      ],
    },
  },
  [UsageResourceType.AI]: {},
  [UsageResourceType.WORKFLOW]: {},
  [UsageResourceType.APP]: {},
  [UsageResourceType.STORAGE]: {},
  [UsageResourceType.LOGIC_FUNCTION]: {},
  [UsageResourceType.EMAIL]: {},
};

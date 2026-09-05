import { isNonEmptyString } from '@sniptt/guards';

import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

const SPENDER_TYPE_BY_USAGE_SPENDERS_KEY: Record<
  keyof UsageSpenders,
  SpenderType
> = {
  userWorkspaceId: 'userWorkspace',
  apiKeyId: 'apiKey',
  applicationId: 'application',
  agentId: 'agent',
  workflowId: 'workflow',
  logicFunctionId: 'logicFunction',
};

export const buildSpendersFromUsageSpenders = (
  usageSpenders: UsageSpenders,
): Spender[] => [
  ...Object.entries(SPENDER_TYPE_BY_USAGE_SPENDERS_KEY).flatMap(
    ([usageSpendersKey, spenderType]) => {
      const spenderId = usageSpenders[usageSpendersKey as keyof UsageSpenders];

      return isNonEmptyString(spenderId) ? [{ spenderType, spenderId }] : [];
    },
  ),
  { spenderType: 'workspace', spenderId: '' },
];

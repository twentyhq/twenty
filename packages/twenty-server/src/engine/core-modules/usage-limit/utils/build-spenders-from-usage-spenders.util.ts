import { isNonEmptyString } from '@sniptt/guards';

import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage-limit/types/usage-spenders.type';

export const buildSpendersFromUsageSpenders = (
  usageSpenders: UsageSpenders,
): Spender[] => {
  const spenders: Spender[] = [];

  const spenderIdByType = {
    userWorkspace: usageSpenders.userWorkspaceId,
    apiKey: usageSpenders.apiKeyId,
    application: usageSpenders.applicationId,
    agent: usageSpenders.agentId,
    workflow: usageSpenders.workflowId,
    logicFunction: usageSpenders.logicFunctionId,
  } as const;

  for (const [spenderType, spenderId] of Object.entries(spenderIdByType)) {
    if (isNonEmptyString(spenderId)) {
      spenders.push({
        spenderType: spenderType as keyof typeof spenderIdByType,
        spenderId,
      });
    }
  }

  spenders.push({ spenderType: 'workspace', spenderId: '' });

  return spenders;
};

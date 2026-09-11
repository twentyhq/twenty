import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

export const USAGE_SPENDER_COLUMN_BY_SPENDER_TYPE: Record<
  Exclude<SpenderType, 'workspace'>,
  keyof UsageSpenders
> = {
  userWorkspace: 'userWorkspaceId',
  apiKey: 'apiKeyId',
  application: 'applicationId',
  agent: 'agentId',
  workflow: 'workflowId',
  logicFunction: 'logicFunctionId',
};

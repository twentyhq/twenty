import { isNonEmptyString } from '@sniptt/guards';

import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

export const isUserCreditsEligibleEvent = ({
  spenders,
}: Pick<RecordUsageInput, 'spenders'>): boolean =>
  isNonEmptyString(spenders?.userWorkspaceId) &&
  !isNonEmptyString(spenders.apiKeyId) &&
  !isNonEmptyString(spenders.applicationId) &&
  !isNonEmptyString(spenders.agentId) &&
  !isNonEmptyString(spenders.workflowId) &&
  !isNonEmptyString(spenders.logicFunctionId);

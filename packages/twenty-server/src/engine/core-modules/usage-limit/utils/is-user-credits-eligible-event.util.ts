import { isNonEmptyString } from '@sniptt/guards';

import { USER_CREDITS_DEFAULT_DEFINITION } from 'src/engine/core-modules/usage-limit/constants/user-credits-default-definition.constant';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

export const isUserCreditsEligibleEvent = ({
  resourceType,
  operationType,
  spenders,
}: Pick<
  RecordUsageInput,
  'resourceType' | 'operationType' | 'spenders'
>): boolean =>
  (USER_CREDITS_DEFAULT_DEFINITION.operationTypesByResourceType[
    resourceType
  ]?.includes(operationType) ??
    false) &&
  isNonEmptyString(spenders?.userWorkspaceId) &&
  !isNonEmptyString(spenders.apiKeyId) &&
  !isNonEmptyString(spenders.applicationId) &&
  !isNonEmptyString(spenders.agentId) &&
  !isNonEmptyString(spenders.workflowId) &&
  !isNonEmptyString(spenders.logicFunctionId);

import { isNonEmptyString } from '@sniptt/guards';

import { MEMBER_CREDITS_DEFAULT_DEFINITION } from 'src/engine/core-modules/usage-limit/constants/member-credits-default-definition.constant';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

// The member pays only as the most specific spender: an app, agent or workflow charging on their behalf stays on the workspace
export const isMemberCreditsEligibleEvent = ({
  resourceType,
  operationType,
  spenders,
}: Pick<
  RecordUsageInput,
  'resourceType' | 'operationType' | 'spenders'
>): boolean =>
  (MEMBER_CREDITS_DEFAULT_DEFINITION.operationTypesByResourceType[
    resourceType
  ]?.includes(operationType) ??
    false) &&
  isNonEmptyString(spenders?.userWorkspaceId) &&
  !isNonEmptyString(spenders.apiKeyId) &&
  !isNonEmptyString(spenders.applicationId) &&
  !isNonEmptyString(spenders.agentId) &&
  !isNonEmptyString(spenders.workflowId) &&
  !isNonEmptyString(spenders.logicFunctionId);

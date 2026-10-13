import { isNonEmptyString } from '@sniptt/guards';

import { type MemberCreditsPayer } from 'src/engine/core-modules/usage-limit/types/member-credits-payer.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

const MEMBER_CREDITS_ELIGIBLE_OPERATION_TYPES: UsageOperationType[] = [
  UsageOperationType.AI_CHAT_TOKEN,
  UsageOperationType.WEB_SEARCH,
];

// Apps can charge AI_CHAT_TOKEN and name any member, so the operation type alone never makes a cost member-funded
export const isMemberCreditsEligibleEvent = ({
  event: { resourceType, operationType, spenders },
  payer,
}: {
  event: Pick<RecordUsageInput, 'resourceType' | 'operationType' | 'spenders'>;
  payer: MemberCreditsPayer;
}): boolean =>
  resourceType === UsageResourceType.AI &&
  MEMBER_CREDITS_ELIGIBLE_OPERATION_TYPES.includes(operationType) &&
  isNonEmptyString(spenders?.userWorkspaceId) &&
  spenders.userWorkspaceId === payer.userWorkspaceId &&
  !isNonEmptyString(spenders.apiKeyId) &&
  !isNonEmptyString(spenders.applicationId) &&
  !isNonEmptyString(spenders.agentId) &&
  !isNonEmptyString(spenders.workflowId) &&
  !isNonEmptyString(spenders.logicFunctionId);

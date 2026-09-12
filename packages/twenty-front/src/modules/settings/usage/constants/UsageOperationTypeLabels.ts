import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { UsageOperationType } from '~/generated-metadata/graphql';

// Exhaustive over the enum, so a new operation type is a compile error here
// rather than a raw key on screen.
export const USAGE_OPERATION_TYPE_LABELS: Record<
  UsageOperationType,
  MessageDescriptor
> = {
  [UsageOperationType.ALL]: msg`All operations`,
  [UsageOperationType.AI_CHAT_TOKEN]: msg`AI Chat`,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: msg`AI Workflow`,
  [UsageOperationType.WORKFLOW_EXECUTION]: msg`Workflow Execution`,
  [UsageOperationType.CODE_EXECUTION]: msg`Code Execution`,
  [UsageOperationType.WEB_SEARCH]: msg`Web Search`,
  [UsageOperationType.CALL_RECORDING]: msg`Call Recording`,
  [UsageOperationType.EMAIL_SEND]: msg`Email Send`,
  [UsageOperationType.API_REQUEST]: msg`API Request`,
  [UsageOperationType.SUBSCRIPTION]: msg`Subscription`,
};

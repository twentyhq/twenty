import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { UsageOperationType } from '~/generated-metadata/graphql';

export const USAGE_OPERATION_TYPE_LABELS: Record<
  UsageOperationType,
  MessageDescriptor
> = {
  [UsageOperationType.ALL]: msg`All operations`,
  [UsageOperationType.AI_CHAT_TOKEN]: msg`Chats`,
  [UsageOperationType.AI_CHAT_INCLUDED]: msg`Included chat`,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: msg`Agents`,
  [UsageOperationType.WORKFLOW_EXECUTION]: msg`Workflow Execution`,
  [UsageOperationType.CODE_EXECUTION]: msg`Code Execution`,
  [UsageOperationType.WEB_SEARCH]: msg`Web Search`,
  [UsageOperationType.CALL_RECORDING]: msg`Call Recording`,
  [UsageOperationType.EMAIL_SEND]: msg`Email Send`,
  [UsageOperationType.MESSAGE_CAMPAIGN_SEND]: msg`Campaign Email Send`,
  [UsageOperationType.API_REQUEST]: msg`API Request`,
  [UsageOperationType.WEBHOOK_CALL]: msg`Webhook Call`,
  [UsageOperationType.STORAGE_FILE]: msg`File Storage`,
  [UsageOperationType.RECORD_WRITE]: msg`Records`,
  [UsageOperationType.SUBSCRIPTION]: msg`Subscription`,
};

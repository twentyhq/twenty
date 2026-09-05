/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageOperationType {
  ALL = 'ALL',
  AI_CHAT_TOKEN = 'AI_CHAT_TOKEN',
  AI_WORKFLOW_TOKEN = 'AI_WORKFLOW_TOKEN',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION',
  CODE_EXECUTION = 'CODE_EXECUTION',
  WEB_SEARCH = 'WEB_SEARCH',
  CALL_RECORDING = 'CALL_RECORDING',
  EMAIL_SEND = 'EMAIL_SEND',
  // Raised by the query runner and read back by the API rate limit, so it is
  // out of twenty-shared's USAGE_OPERATION_TYPES: an app billing under it
  // would spend the workspace's request budget.
  API_REQUEST = 'API_REQUEST',
  // Platform-raised, once per billing period. Also out of
  // USAGE_OPERATION_TYPES: an app declares the amount, it never charges this.
  SUBSCRIPTION = 'SUBSCRIPTION',
}

registerEnumType(UsageOperationType, {
  name: 'UsageOperationType',
});

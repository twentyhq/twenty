/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageOperationType {
  ALL = 'ALL',
  AI_CHAT_TOKEN = 'AI_CHAT_TOKEN',
  // Out of twenty-shared's USAGE_OPERATION_TYPES: its rows skip the credit allowance, so an app billing under it would charge nothing.
  AI_CHAT_INCLUDED = 'AI_CHAT_INCLUDED',
  AI_WORKFLOW_TOKEN = 'AI_WORKFLOW_TOKEN',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION',
  CODE_EXECUTION = 'CODE_EXECUTION',
  WEB_SEARCH = 'WEB_SEARCH',
  CALL_RECORDING = 'CALL_RECORDING',
  EMAIL_SEND = 'EMAIL_SEND',
  MESSAGE_CAMPAIGN_SEND = 'MESSAGE_CAMPAIGN_SEND',
  // Out of twenty-shared's USAGE_OPERATION_TYPES: the API rate limit reads it, so an app billing under it would spend the request budget.
  API_REQUEST = 'API_REQUEST',
  WEBHOOK_CALL = 'WEBHOOK_CALL',
  STORAGE_FILE = 'STORAGE_FILE',
  RECORD_WRITE = 'RECORD_WRITE',
  // Platform-raised once per billing period; also out of USAGE_OPERATION_TYPES since apps only declare the amount.
  SUBSCRIPTION = 'SUBSCRIPTION',
}

registerEnumType(UsageOperationType, {
  name: 'UsageOperationType',
});

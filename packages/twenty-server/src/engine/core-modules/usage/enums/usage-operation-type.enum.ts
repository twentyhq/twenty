/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageOperationType {
  ALL = 'ALL',
  AI_CHAT_TOKEN = 'AI_CHAT_TOKEN',
  AI_WORKFLOW_TOKEN = 'AI_WORKFLOW_TOKEN',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION',
  CODE_EXECUTION = 'CODE_EXECUTION',
  // Platform-raised keep-warm pings of isWarm logic functions, kept apart from real runs.
  CODE_KEEP_WARM = 'CODE_KEEP_WARM',
  WEB_SEARCH = 'WEB_SEARCH',
  AI_WORKFLOW_WEB_SEARCH = 'AI_WORKFLOW_WEB_SEARCH',
  CALL_RECORDING = 'CALL_RECORDING',
  EMAIL_SEND = 'EMAIL_SEND',
  MESSAGE_CAMPAIGN_SEND = 'MESSAGE_CAMPAIGN_SEND',
  // Charged by apps through chargeCredits when they name no platform category
  APP_OPERATION = 'APP_OPERATION',
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

/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageOperationType {
  AI_CHAT_TOKEN = 'AI_CHAT_TOKEN',
  AI_WORKFLOW_TOKEN = 'AI_WORKFLOW_TOKEN',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION',
  CODE_EXECUTION = 'CODE_EXECUTION',
  WEB_SEARCH = 'WEB_SEARCH',
  CALL_RECORDING = 'CALL_RECORDING',
  EMAIL_SEND = 'EMAIL_SEND',
  // Platform-raised, once per billing period. Not in twenty-shared's
  // USAGE_OPERATION_TYPES: an app declares the amount, it never charges this.
  SUBSCRIPTION = 'SUBSCRIPTION',
}

registerEnumType(UsageOperationType, {
  name: 'UsageOperationType',
});

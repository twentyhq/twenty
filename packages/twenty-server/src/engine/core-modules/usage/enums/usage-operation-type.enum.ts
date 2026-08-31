/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageOperationType {
  // limit-scope wildcard covering every operation of a resource; never emitted on a usage event
  ALL = 'ALL',
  AI_CHAT_TOKEN = 'AI_CHAT_TOKEN',
  AI_WORKFLOW_TOKEN = 'AI_WORKFLOW_TOKEN',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION',
  CODE_EXECUTION = 'CODE_EXECUTION',
  WEB_SEARCH = 'WEB_SEARCH',
  CALL_RECORDING = 'CALL_RECORDING',
  EMAIL_SEND = 'EMAIL_SEND',
  API_REQUEST = 'API_REQUEST',
}

registerEnumType(UsageOperationType, {
  name: 'UsageOperationType',
});

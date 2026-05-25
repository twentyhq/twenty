/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageOperationType {
  AI_CHAT_TOKEN = 'AI_CHAT_TOKEN',
  AI_WORKFLOW_TOKEN = 'AI_WORKFLOW_TOKEN',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION',
  CODE_EXECUTION = 'CODE_EXECUTION',
  WEB_SEARCH = 'WEB_SEARCH',
}

registerEnumType(UsageOperationType, {
  name: 'UsageOperationType',
});

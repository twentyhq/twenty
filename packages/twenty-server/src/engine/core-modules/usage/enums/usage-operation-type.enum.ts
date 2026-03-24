/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageOperationType {
  AI_TOKEN = 'AI_TOKEN',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION',
  CODE_EXECUTION = 'CODE_EXECUTION',
}

registerEnumType(UsageOperationType, {
  name: 'UsageOperationType',
});

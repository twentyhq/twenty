/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageResourceType {
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  APP = 'APP',
  STORAGE = 'STORAGE',
  API = 'API',
  LOGIC_FUNCTION = 'LOGIC_FUNCTION',
  EMAIL = 'EMAIL',
}

registerEnumType(UsageResourceType, {
  name: 'UsageResourceType',
});

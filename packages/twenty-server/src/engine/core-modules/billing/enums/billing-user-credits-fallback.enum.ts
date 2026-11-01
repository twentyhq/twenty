/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UserCreditsFallback {
  WORKSPACE_CREDITS = 'WORKSPACE_CREDITS',
  STOP = 'STOP',
}

registerEnumType(UserCreditsFallback, {
  name: 'UserCreditsFallback',
});

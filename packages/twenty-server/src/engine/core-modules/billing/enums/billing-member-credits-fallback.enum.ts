/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum MemberCreditsFallback {
  WORKSPACE_CREDITS = 'WORKSPACE_CREDITS',
  STOP = 'STOP',
}

registerEnumType(MemberCreditsFallback, {
  name: 'MemberCreditsFallback',
});

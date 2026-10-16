/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageUnit {
  CREDIT = 'CREDIT',
  USER_CREDIT = 'USER_CREDIT',
  TOKEN = 'TOKEN',
  INVOCATION = 'INVOCATION',
  MINUTE = 'MINUTE',
  MILLISECOND = 'MILLISECOND',
  BYTE = 'BYTE',
  FILE = 'FILE',
  REQUEST = 'REQUEST',
  SEAT = 'SEAT',
  RECORD = 'RECORD',
  COMPLEXITY = 'COMPLEXITY',
}

registerEnumType(UsageUnit, {
  name: 'UsageUnit',
});

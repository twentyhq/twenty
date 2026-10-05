/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum UsageUnit {
  CREDIT = 'CREDIT',
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
  ESTIMATED_ROWS_READ = 'ESTIMATED_ROWS_READ',
  ESTIMATED_ROWS_WRITTEN = 'ESTIMATED_ROWS_WRITTEN',
}

registerEnumType(UsageUnit, {
  name: 'UsageUnit',
});

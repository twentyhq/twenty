import { registerEnumType } from '@nestjs/graphql';

export enum DateFormat {
  SYSTEM = 'SYSTEM',
  MONTH_FIRST = 'MONTH_FIRST',
  DAY_FIRST = 'DAY_FIRST',
  YEAR_FIRST = 'YEAR_FIRST',
}

registerEnumType(DateFormat, {
  name: 'DateFormat',
  description: 'Date format',
});

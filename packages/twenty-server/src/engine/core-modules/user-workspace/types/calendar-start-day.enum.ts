import { registerEnumType } from '@nestjs/graphql';

export enum CalendarStartDay {
  SYSTEM = 'SYSTEM',
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  SATURDAY = 'SATURDAY',
}

registerEnumType(CalendarStartDay, {
  name: 'CalendarStartDay',
  description: 'Calendar start day',
});

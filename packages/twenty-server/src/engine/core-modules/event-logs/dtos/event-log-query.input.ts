import { Field, InputType, Int } from '@nestjs/graphql';

import { EventLogTable } from 'twenty-shared/types';

import { EventLogFiltersInput } from './event-log-filters.input';
import { registerEventLogTableEnum } from './event-log-table.enum';

registerEventLogTableEnum();

@InputType()
export class EventLogQueryInput {
  @Field(() => EventLogTable)
  table: EventLogTable;

  @Field(() => EventLogFiltersInput, { nullable: true })
  filters?: EventLogFiltersInput;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  first?: number;

  @Field(() => String, { nullable: true })
  after?: string;
}

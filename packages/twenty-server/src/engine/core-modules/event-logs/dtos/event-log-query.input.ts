import { Field, InputType, Int } from '@nestjs/graphql';

import { EventLogFiltersInput } from './event-log-filters.input';
import { EventLogOrderByInput } from './event-log-order-by.input';
import { EventLogTable } from './event-log-table.enum';

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

  @Field(() => EventLogOrderByInput, { nullable: true })
  orderBy?: EventLogOrderByInput;
}

import { Field, InputType, Int } from '@nestjs/graphql';

import { EventLogFiltersInput } from './event-log-filters.input';
import { EventLogOrderByInput } from './event-log-order-by.input';
import { EventLogTable } from './event-log-table.enum';

@InputType()
export class EventLogQueryInput {
  @Field(() => EventLogTable, { description: 'The table to query' })
  table: EventLogTable;

  @Field(() => EventLogFiltersInput, {
    nullable: true,
    description: 'Filters to apply to the query',
  })
  filters?: EventLogFiltersInput;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 100,
    description: 'Maximum number of records to return',
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: 'Number of records to skip',
  })
  offset?: number;

  @Field(() => EventLogOrderByInput, {
    nullable: true,
    description: 'Order by configuration',
  })
  orderBy?: EventLogOrderByInput;
}

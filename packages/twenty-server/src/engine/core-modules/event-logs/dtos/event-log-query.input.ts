import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
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
  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  first?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  instanceLevel?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  includeActivity?: boolean;

  @Field(() => String, { nullable: true })
  after?: string;
}

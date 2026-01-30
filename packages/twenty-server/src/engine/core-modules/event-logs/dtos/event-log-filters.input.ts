import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EventLogDateRangeInput {
  @Field(() => Date, { nullable: true })
  start?: Date;

  @Field(() => Date, { nullable: true })
  end?: Date;
}

@InputType()
export class EventLogFiltersInput {
  @Field(() => String, { nullable: true, description: 'Filter by event type' })
  eventType?: string;

  @Field(() => String, { nullable: true, description: 'Filter by user ID' })
  userId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Filter by workspace member ID (will resolve to user ID)',
  })
  workspaceMemberId?: string;

  @Field(() => EventLogDateRangeInput, {
    nullable: true,
    description: 'Filter by timestamp range',
  })
  dateRange?: EventLogDateRangeInput;

  @Field(() => String, {
    nullable: true,
    description: 'Filter by record ID (objectEvent only)',
  })
  recordId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Filter by object metadata ID (objectEvent only)',
  })
  objectMetadataId?: string;
}

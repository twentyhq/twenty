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
  @Field(() => String, { nullable: true })
  eventType?: string;

  @Field(() => String, { nullable: true })
  userWorkspaceId?: string;

  @Field(() => EventLogDateRangeInput, { nullable: true })
  dateRange?: EventLogDateRangeInput;

  @Field(() => String, { nullable: true })
  recordId?: string;

  @Field(() => String, { nullable: true })
  objectMetadataId?: string;
}

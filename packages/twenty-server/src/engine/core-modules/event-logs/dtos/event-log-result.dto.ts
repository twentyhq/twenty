import { Field, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class EventLogRecord {
  @Field(() => String)
  event: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  properties?: Record<string, unknown>;

  @Field(() => String, { nullable: true })
  recordId?: string;

  @Field(() => String, { nullable: true })
  objectMetadataId?: string;

  @Field(() => Boolean, { nullable: true })
  isCustom?: boolean;
}

@ObjectType()
export class EventLogPageInfo {
  @Field(() => String, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean)
  hasNextPage: boolean;
}

@ObjectType()
export class ApplicationLogActivityBucket {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;

  @Field(() => Int)
  info: number;

  @Field(() => Int)
  warning: number;

  @Field(() => Int)
  error: number;
}

@ObjectType()
export class EventLogQueryResult {
  @Field(() => Boolean)
  canQueryInstanceLevel: boolean;

  @Field(() => [ApplicationLogActivityBucket], { nullable: true })
  activity?: ApplicationLogActivityBucket[];

  @Field(() => [EventLogRecord])
  records: EventLogRecord[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => EventLogPageInfo)
  pageInfo: EventLogPageInfo;
}

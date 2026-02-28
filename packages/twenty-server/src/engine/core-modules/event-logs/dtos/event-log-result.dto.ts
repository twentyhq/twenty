import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class EventLogRecord {
  @Field(() => String)
  event: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => String, { nullable: true })
  userWorkspaceId?: string;

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
export class EventLogQueryResult {
  @Field(() => [EventLogRecord])
  records: EventLogRecord[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => EventLogPageInfo)
  pageInfo: EventLogPageInfo;
}

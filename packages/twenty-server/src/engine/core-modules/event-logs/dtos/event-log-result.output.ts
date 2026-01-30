import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class EventLogRecord {
  @Field(() => String, { description: 'Event type or page name' })
  event: string;

  @Field(() => Date, { description: 'Timestamp of the event' })
  timestamp: Date;

  @Field(() => String, { nullable: true, description: 'User ID who triggered the event' })
  userId?: string;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Additional event properties' })
  properties?: Record<string, unknown>;

  @Field(() => String, { nullable: true, description: 'Record ID (objectEvent only)' })
  recordId?: string;

  @Field(() => String, { nullable: true, description: 'Object metadata ID (objectEvent only)' })
  objectMetadataId?: string;

  @Field(() => Boolean, { nullable: true, description: 'Is custom object (objectEvent only)' })
  isCustom?: boolean;
}

@ObjectType()
export class EventLogQueryResult {
  @Field(() => [EventLogRecord], { description: 'The event log records' })
  records: EventLogRecord[];

  @Field(() => Int, { description: 'Total count of records matching the query' })
  totalCount: number;

  @Field(() => Boolean, { description: 'Whether there are more records to fetch' })
  hasNextPage: boolean;
}

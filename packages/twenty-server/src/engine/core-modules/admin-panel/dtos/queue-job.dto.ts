import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { JobState } from 'src/engine/core-modules/admin-panel/enums/job-state.enum';

@ObjectType()
export class QueueJob {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: object;

  @Field(() => JobState)
  state: JobState;

  @Field(() => Number, { nullable: true })
  timestamp?: number;

  @Field(() => String, { nullable: true })
  failedReason?: string;

  @Field(() => Number, { nullable: true })
  processedOn?: number;

  @Field(() => Number, { nullable: true })
  finishedOn?: number;

  @Field(() => Number)
  attemptsMade: number;

  @Field(() => GraphQLJSON, { nullable: true })
  returnvalue?: object;

  @Field(() => [String], { nullable: true })
  logs?: string[];

  @Field(() => [String], { nullable: true })
  stacktrace?: string[];
}

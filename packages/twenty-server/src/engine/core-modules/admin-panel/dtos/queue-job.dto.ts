import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { JobStateEnum } from 'src/engine/core-modules/admin-panel/enums/job-state.enum';

@ObjectType('QueueJob')
export class QueueJobDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: object;

  @Field(() => JobStateEnum)
  state: JobStateEnum;

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
  returnValue?: object;

  @Field(() => [String], { nullable: true })
  logs?: string[];

  @Field(() => [String], { nullable: true })
  stackTrace?: string[];
}

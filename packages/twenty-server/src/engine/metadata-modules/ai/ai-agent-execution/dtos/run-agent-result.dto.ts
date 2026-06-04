import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type RunAgentResult } from 'twenty-shared/application';

@ObjectType('RunAgentResult')
export class RunAgentResultDTO implements RunAgentResult {
  @Field(() => GraphQLJSON)
  result: object;

  @IsBoolean()
  @Field()
  hasNoMoreAvailableCredits: boolean;
}

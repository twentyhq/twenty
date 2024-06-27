import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@ObjectType('AskAIQueryResult')
export class AskAIQueryResult {
  @Field(() => String)
  sqlQuery: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  sqlQueryResult?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  recordDisplayDataById?: any;

  @Field(() => String, { nullable: true })
  @IsOptional()
  queryFailedErrorMessage?: string;
}

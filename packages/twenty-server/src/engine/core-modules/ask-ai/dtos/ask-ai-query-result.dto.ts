import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AskAIQueryResult')
export class AskAIQueryResult {
  @Field(() => String)
  sqlQuery: string;

  @Field(() => String)
  sqlQueryResult: string;
}

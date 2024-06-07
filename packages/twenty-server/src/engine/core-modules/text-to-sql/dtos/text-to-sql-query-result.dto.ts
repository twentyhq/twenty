import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TextToSQLQueryResult')
export class TextToSQLQueryResult {
  @Field(() => String)
  sqlQuery: string;

  @Field(() => String)
  sqlQueryResult: string;
}

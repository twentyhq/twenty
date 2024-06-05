import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TextToSQLQueryResult')
export class TextToSQLQueryResult {
  @Field(() => String)
  tableJson: string;
}

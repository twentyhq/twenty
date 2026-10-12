import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('DeduplicateAppConnectionResult')
export class DeduplicateAppConnectionResult {
  @Field(() => ID)
  connectedAccountId: string;

  @Field()
  wasMerged: boolean;
}

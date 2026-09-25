import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType('AiChatUsage')
export class AiChatUsageDTO {
  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  consumedValue: number | null;

  @Field(() => Date, { nullable: true })
  periodEnd: Date | null;

  @Field(() => Boolean)
  isUsageLimit: boolean;
}

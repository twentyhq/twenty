import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';

@ObjectType('AiChatUserCredits')
export class AiChatUserCreditsDTO {
  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  consumedValue: number | null;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => UserCreditsFallback)
  fallback: UserCreditsFallback;

  @Field(() => Boolean)
  isUsingWorkspaceCredits: boolean;
}

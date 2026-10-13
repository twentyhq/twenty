import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

import { MemberCreditsFallback } from 'src/engine/core-modules/workspace/types/member-credits-fallback.type';

@ObjectType('AiChatMemberCredits')
export class AiChatMemberCreditsDTO {
  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  consumedValue: number | null;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => MemberCreditsFallback)
  fallback: MemberCreditsFallback;

  @Field(() => Boolean)
  isUsingWorkspaceCredits: boolean;
}

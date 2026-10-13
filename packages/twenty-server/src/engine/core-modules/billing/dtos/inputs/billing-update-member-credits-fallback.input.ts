/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum } from 'class-validator';

import { MemberCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-member-credits-fallback.enum';

@ArgsType()
export class BillingUpdateMemberCreditsFallbackInput {
  @Field(() => MemberCreditsFallback)
  @IsEnum(MemberCreditsFallback)
  memberCreditsFallback: MemberCreditsFallback;
}

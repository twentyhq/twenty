/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum } from 'class-validator';

import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';

@ArgsType()
export class BillingUpdateUserCreditsFallbackInput {
  @Field(() => UserCreditsFallback)
  @IsEnum(UserCreditsFallback)
  userCreditsFallback: UserCreditsFallback;
}

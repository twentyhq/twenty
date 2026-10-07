/* @license Enterprise */

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingCreditOneTimeTopUpPrice')
export class BillingCreditOneTimeTopUpPriceDTO {
  @Field(() => Int, { description: 'Price of one credit before tax, in cents' })
  amountCentsPerCredit: number;

  @Field(() => String)
  currency: string;

  @Field(() => Int)
  minimumCreditAmount: number;

  @Field(() => Int)
  maximumCreditAmount: number;
}

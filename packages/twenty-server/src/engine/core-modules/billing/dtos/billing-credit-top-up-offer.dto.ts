/* @license Enterprise */

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingCreditTopUpOffer')
export class BillingCreditTopUpOfferDTO {
  @Field(() => Float, { description: 'Credits added to the workspace' })
  creditAmount: number;

  @Field(() => Float, { description: 'Price before tax, in cents' })
  amountCents: number;

  @Field(() => String)
  currency: string;
}

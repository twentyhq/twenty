/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingPaymentIntent')
export class BillingPaymentIntentDTO {
  @Field(() => String)
  clientSecret: string;

  @Field(() => String)
  paymentIntentType: string;
}

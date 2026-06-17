/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingPaymentIntent')
export class BillingPaymentIntentDTO {
  @Field(() => String)
  clientSecret: string;

  // 'setup' for free trials (no upfront charge) or 'payment' for an immediate
  // charge, so the client knows whether to confirmSetup or confirmPayment.
  @Field(() => String)
  paymentIntentType: string;
}

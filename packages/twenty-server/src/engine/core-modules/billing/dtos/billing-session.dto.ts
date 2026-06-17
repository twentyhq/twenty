/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingSession')
export class BillingSessionDTO {
  @Field(() => String, { nullable: true })
  url?: string;

  // Returned instead of `url` when the subscription is created server-side and
  // the payment method is collected inline via the Stripe Payment Element.
  // Holds the client secret of the subscription's pending SetupIntent.
  @Field(() => String, { nullable: true })
  clientSecret?: string;
}

/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingPriceMetadata {
  @Field(() => String, { nullable: true })
  credit_amount?: string;

  // Superseded price: still billable for the subscriptions on it, never sold again.
  @Field(() => String, { nullable: true })
  isLegacy?: string;

  [key: string]: string | undefined;
}

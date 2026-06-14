/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingPriceMetadata {
  @Field(() => String, { nullable: true })
  credit_amount?: string;

  [key: string]: string | undefined;
}

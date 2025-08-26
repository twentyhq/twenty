/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingPriceMetadata {
  @Field(() => String, { nullable: true })
  isDefaultMeteredPrice: string | null;

  [key: string]: string | null;
}

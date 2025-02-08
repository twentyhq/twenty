/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingPriceTierDTO {
  @Field(() => Number, { nullable: true })
  upTo: number | null;

  @Field(() => Number, { nullable: true })
  flatAmount: number | null;

  @Field(() => Number, { nullable: true })
  unitAmount: number | null;
}

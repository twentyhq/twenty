/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingProductDTO } from 'src/engine/core-modules/billing/dtos/billing-product.dto';

@ObjectType()
export class BillingSubscriptionItemDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => Boolean)
  hasReachedCurrentPeriodCap: boolean;

  @Field(() => Number, { nullable: true })
  quantity: number | null;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => BillingProductDTO)
  billingProduct: BillingProductDTO;
}

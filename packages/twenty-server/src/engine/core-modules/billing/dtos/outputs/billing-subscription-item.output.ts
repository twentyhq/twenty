/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingProductDTO } from 'src/engine/core-modules/billing/dtos/billing-product.dto';

@ObjectType('BillingSubscriptionItem')
export class BillingSubscriptionItemDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => Boolean)
  hasReachedCurrentPeriodCap: boolean;

  @Field(() => BillingProductDTO, { nullable: true })
  billingProduct: BillingProductDTO;
}

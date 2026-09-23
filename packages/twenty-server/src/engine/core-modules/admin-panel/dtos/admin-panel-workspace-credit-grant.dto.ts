import { Field, Float, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';

@ObjectType('AdminPanelWorkspaceCreditGrant')
export class AdminPanelWorkspaceCreditGrantDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field(() => BillingCreditGrantType)
  type: BillingCreditGrantType;

  @Field(() => Date)
  effectiveAt: Date;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  @Field(() => Date, { nullable: true })
  revokedAt: Date | null;

  // Set when this grant carries the unspent part of an earlier one forward, so
  // the admin panel can show one row per grant instead of one row per period.
  @Field(() => UUIDScalarType, { nullable: true })
  sourceGrantId: string | null;

  @Field(() => String, { nullable: true })
  reason: string | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;
}

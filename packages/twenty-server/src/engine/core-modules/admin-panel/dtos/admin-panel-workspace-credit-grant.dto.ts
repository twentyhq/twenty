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

  @Field(() => Date)
  expiresAt: Date;

  @Field(() => Date, { nullable: true })
  revokedAt: Date | null;

  @Field(() => String, { nullable: true })
  reason: string | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;
}

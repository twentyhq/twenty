import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';

@ObjectType('AdminPanelWorkspaceBillingArrangement')
export class AdminPanelWorkspaceBillingArrangementDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => BillingArrangementType)
  type: BillingArrangementType;

  @Field(() => BillingArrangementLabel)
  label: BillingArrangementLabel;

  @Field(() => String, { nullable: true })
  comment: string | null;

  @Field(() => Int, { nullable: true })
  seats: number | null;

  @Field(() => BillingArrangementSeatCapMode, { nullable: true })
  seatCapMode: BillingArrangementSeatCapMode | null;

  @Field(() => String, { nullable: true })
  stripeDiscountId: string | null;

  @Field(() => Float, { nullable: true })
  creditAllowance: number | null;

  @Field(() => String, { nullable: true })
  stripeCreditNoteId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  creditGrantId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  usageLimitId: string | null;

  @Field(() => Date)
  startsAt: Date;

  @Field(() => Date, { nullable: true })
  endsAt: Date | null;

  @Field(() => Date, { nullable: true })
  revokedAt: Date | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;
}

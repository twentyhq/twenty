import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UserInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementStatus } from 'src/engine/core-modules/billing/enums/billing-arrangement-status.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';

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

  @Field(() => UsageLimitDTO, { nullable: true })
  usageLimit: UsageLimitDTO | null;

  @Field(() => Date)
  startsAt: Date;

  @Field(() => Date, { nullable: true })
  endDate: Date | null;

  @Field(() => BillingArrangementStatus)
  status: BillingArrangementStatus;

  @Field(() => Boolean)
  isManageable: boolean;

  @Field(() => UserInfoDTO, { nullable: true })
  grantedBy: UserInfoDTO | null;

  @Field(() => UserInfoDTO, { nullable: true })
  revokedBy: UserInfoDTO | null;

  @Field(() => Date)
  createdAt: Date;
}

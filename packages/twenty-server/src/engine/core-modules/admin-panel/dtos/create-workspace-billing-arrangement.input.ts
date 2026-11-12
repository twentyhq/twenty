import {
  ArgsType,
  Field,
  Float,
  GraphQLISODateTime,
  Int,
} from '@nestjs/graphql';

import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BILLING_ARRANGEMENT_COMMENT_MAX_LENGTH } from 'src/engine/core-modules/billing/constants/billing-arrangement-comment-max-length.constant';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';

@ArgsType()
export class CreateWorkspaceBillingArrangementInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => BillingArrangementType)
  @IsEnum(BillingArrangementType)
  type: BillingArrangementType;

  @Field(() => BillingArrangementLabel)
  @IsEnum(BillingArrangementLabel)
  label: BillingArrangementLabel;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BILLING_ARRANGEMENT_COMMENT_MAX_LENGTH)
  comment?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsAt?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  seats?: number;

  @Field(() => BillingArrangementSeatCapMode, { nullable: true })
  @IsOptional()
  @IsEnum(BillingArrangementSeatCapMode)
  seatCapMode?: BillingArrangementSeatCapMode;

  // In display credits per month ($1 = 1 credit), converted to micro-credits server side
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditAllowance?: number;
}

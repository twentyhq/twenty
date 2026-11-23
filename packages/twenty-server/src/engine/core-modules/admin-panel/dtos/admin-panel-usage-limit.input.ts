import { ArgsType, Field } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BILLING_ARRANGEMENT_COMMENT_MAX_LENGTH } from 'src/engine/core-modules/billing/constants/billing-arrangement-comment-max-length.constant';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';

@ArgsType()
export class AdminPanelWorkspaceUsageLimitsInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;
}

@ArgsType()
export class AdminPanelCreateUsageLimitInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => CreateUsageLimitInput)
  @Type(() => CreateUsageLimitInput)
  @ValidateNested()
  payload: CreateUsageLimitInput;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endsAt?: Date | null;

  @Field(() => BillingArrangementLabel, { nullable: true })
  @IsOptional()
  @IsEnum(BillingArrangementLabel)
  label?: BillingArrangementLabel | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BILLING_ARRANGEMENT_COMMENT_MAX_LENGTH)
  comment?: string | null;
}

@ArgsType()
export class AdminPanelDeleteUsageLimitInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  usageLimitId: string;
}

import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BILLING_ARRANGEMENT_COMMENT_MAX_LENGTH } from 'src/engine/core-modules/billing/constants/billing-arrangement-comment-max-length.constant';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';

@ArgsType()
export class AdminPanelExtendWorkspaceTrialInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => Date)
  @IsDate()
  trialEndsAt: Date;

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
export class AdminPanelRevokeWorkspaceTrialExtensionInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;
}

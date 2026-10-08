import { ArgsType, Field, Float, Int } from '@nestjs/graphql';

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';

// Raising it means raising MAX_PERIODS_AHEAD too, or a long validity silently comes back short
const MAX_CREDIT_GRANT_VALIDITY_IN_DAYS = 365;

@ArgsType()
export class GrantWorkspaceCreditsInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  // In display credits ($1 = 1 credit), converted to micro-credits server side.
  @Field(() => Float)
  @IsPositive()
  amount: number;

  @Field(() => BillingCreditGrantType)
  @IsEnum(BillingCreditGrantType)
  type: BillingCreditGrantType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  // Omitted, credits stay spendable until a period transition settles them against usage
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(MAX_CREDIT_GRANT_VALIDITY_IN_DAYS)
  expiresInDays?: number;

  // Idempotency key: a retried mutation returns the first attempt's grant
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  clientOperationId: string;
}

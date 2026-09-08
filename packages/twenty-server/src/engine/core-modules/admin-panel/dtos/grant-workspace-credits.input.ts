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

const MAX_CREDIT_GRANT_VALIDITY_IN_DAYS = 3650;

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

  // Left out, the credits do not expire: they stay spendable until a period
  // transition settles them against usage. Set only for a time-boxed grant.
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(MAX_CREDIT_GRANT_VALIDITY_IN_DAYS)
  expiresInDays?: number;

  // Identifies one intended grant, so a retried mutation returns the grant the
  // first attempt wrote instead of handing out the credits a second time.
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  clientOperationId: string;
}

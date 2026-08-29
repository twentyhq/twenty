import { ArgsType, Field, Float } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';

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

  // Identifies one intended grant, so a retried mutation returns the grant the
  // first attempt wrote instead of handing out the credits a second time.
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  clientOperationId: string;
}

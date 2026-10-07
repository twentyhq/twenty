/* @license Enterprise */

import { ArgsType, Field, Float } from '@nestjs/graphql';

import { IsNotEmpty, IsPositive, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class BillingPurchaseCreditOneTimeTopUpInput {
  @Field(() => Float)
  @IsPositive()
  creditAmount: number;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  idempotencyKey: string;
}

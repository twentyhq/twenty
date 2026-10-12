/* @license Enterprise */

import { ArgsType, Field, Int } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class BillingPurchaseCreditOneTimeTopUpInput {
  @Field(() => Int)
  @IsInt()
  creditAmount: number;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  idempotencyKey: string;
}

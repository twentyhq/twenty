/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class BillingUpdateUserAiChatBudgetInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  userWorkspaceId: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxCreditsPerPeriod: number | null;
}

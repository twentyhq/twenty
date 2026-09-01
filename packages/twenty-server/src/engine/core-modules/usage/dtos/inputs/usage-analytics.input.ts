/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { ArrayNotContains, IsOptional } from 'class-validator';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

@InputType()
export class UsageAnalyticsInput {
  @Field(() => Date, { nullable: true })
  periodStart?: Date;

  @Field(() => Date, { nullable: true })
  periodEnd?: Date;

  @Field(() => String, { nullable: true })
  userWorkspaceId?: string;

  @Field(() => [UsageOperationType], { nullable: true })
  @IsOptional()
  // ALL scopes limit rules; no usage event carries it, so filtering on it
  // would silently match nothing.
  @ArrayNotContains([UsageOperationType.ALL])
  operationTypes?: UsageOperationType[];
}

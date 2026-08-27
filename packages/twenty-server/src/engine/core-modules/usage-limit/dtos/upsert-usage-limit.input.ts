import { Field, InputType, Int } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { LIMIT_KINDS } from 'src/engine/core-modules/usage-limit/constants/limit-kinds.constant';
import { LIMIT_VALUE_TYPES } from 'src/engine/core-modules/usage-limit/constants/limit-value-types.constant';
import { SPENDER_TYPES } from 'src/engine/core-modules/usage-limit/constants/spender-types.constant';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@InputType()
export class UpsertUsageLimitInput {
  @Field(() => UsageResourceType)
  @IsEnum(UsageResourceType)
  resourceType: UsageResourceType;

  // Null targets every operation of the resource.
  @Field(() => UsageOperationType, { nullable: true })
  @IsEnum(UsageOperationType)
  @IsOptional()
  operationType?: UsageOperationType | null;

  @Field(() => String)
  @IsIn(SPENDER_TYPES)
  spenderType: SpenderType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  spenderId?: string | null;

  @Field(() => String)
  @IsIn(LIMIT_KINDS)
  limitKind: LimitKind;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  windowSeconds: number;

  @Field(() => String, { defaultValue: 'absolute' })
  @IsIn(LIMIT_VALUE_TYPES)
  limitValueType: LimitValueType;

  @Field(() => GraphQLBigInt)
  @IsInt()
  @Min(1)
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  burstValue?: number | null;
}

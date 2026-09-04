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
import { PERIOD_UNITS } from 'src/engine/core-modules/usage-limit/constants/period-units.constant';
import { USAGE_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';
import { SPENDER_TYPES } from 'src/engine/core-modules/usage-limit/constants/spender-types.constant';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@InputType()
export class UpsertUsageLimitInput {
  @Field(() => UsageResourceType)
  @IsEnum(UsageResourceType)
  resourceType: UsageResourceType;

  @Field(() => UsageOperationType)
  @IsEnum(UsageOperationType)
  operationType: UsageOperationType;

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

  @Field(() => Int)
  @IsInt()
  @Min(1)
  periodCount: number;

  @Field(() => String)
  @IsIn(PERIOD_UNITS)
  periodUnit: PeriodUnit;

  @Field(() => String)
  @IsIn(USAGE_METERS)
  meter: UsageMeter;

  @Field(() => String)
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

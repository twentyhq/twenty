import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { type LimitKind } from 'src/engine/core-modules/usage-limit/enums/limit-kind.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/enums/spender-type.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { LIMIT_KINDS } from 'src/engine/core-modules/usage-limit/constants/limit-kinds.constant';
import { SPENDER_TYPES } from 'src/engine/core-modules/usage-limit/constants/spender-types.constant';

@InputType()
export class UpsertUsageLimitInput {
  @Field(() => String)
  @IsEnum(UsageResourceType)
  resourceType: UsageResourceType;

  @Field(() => String)
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

  @Field(() => Number, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  windowSeconds: number;

  @Field(() => Number)
  @IsInt()
  @Min(1)
  limitValue: number;

  @Field(() => Number, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  burstValue?: number | null;
}

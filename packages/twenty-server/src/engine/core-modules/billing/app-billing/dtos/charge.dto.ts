/* @license Enterprise */

import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

// $1000 in micro-credits (1 USD = 1_000_000 micro-credits). Bounds a single
// charge so a compromised or buggy app can't drain credits in one request.
const MAX_CREDITS_USED_MICRO_PER_CHARGE = 1_000_000_000;
const MAX_QUANTITY_PER_CHARGE = 10_000;

export class ChargeDto {
  @IsInt()
  @Min(0)
  @Max(MAX_CREDITS_USED_MICRO_PER_CHARGE)
  creditsUsedMicro!: number;

  @IsInt()
  @Min(1)
  @Max(MAX_QUANTITY_PER_CHARGE)
  quantity!: number;

  @IsEnum(UsageOperationType)
  operationType!: UsageOperationType;

  @IsOptional()
  @IsString()
  resourceContext?: string;
}

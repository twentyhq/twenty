/* @license Enterprise */

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import {
  USAGE_OPERATION_TYPES,
  type UsageOperationTypeValue,
} from 'twenty-shared/application';

// $1000 in micro-credits, so a compromised or buggy app can't drain credits in one request
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

  // Declared in the manifest's `billing.operations`; the server resolves its category and label
  @IsOptional()
  @IsString()
  operation?: string;

  // Restricted so platform-raised categories cannot be charged; omitted, the charge lands in APP_OPERATION
  @IsOptional()
  @IsIn(USAGE_OPERATION_TYPES)
  operationType?: UsageOperationTypeValue;

  @IsOptional()
  @IsString()
  resourceContext?: string;

  // Webhook and cron runs carry no triggering person on the token, so the app names who the spend belongs to
  @IsOptional()
  @IsUUID()
  userWorkspaceId?: string;
}

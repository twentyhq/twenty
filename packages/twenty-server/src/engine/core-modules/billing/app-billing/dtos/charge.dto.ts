/* @license Enterprise */

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import {
  USAGE_OPERATION_TYPES,
  type UsageOperationTypeValue,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

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

  // For apps declaring no operations; restricted so platform-raised categories cannot be charged
  @ValidateIf((charge: ChargeDto) => !isDefined(charge.operation))
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

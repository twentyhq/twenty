/* @license Enterprise */

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

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

  // An operation name declared in `billableOperations` on the application
  // manifest; the server resolves its billing category and its label.
  @IsOptional()
  @IsString()
  operation?: string;

  // Applications that declare no billable operations name the platform
  // billing category directly.
  @ValidateIf((charge: ChargeDto) => !isDefined(charge.operation))
  @IsEnum(UsageOperationType)
  operationType?: UsageOperationType;

  @IsOptional()
  @IsString()
  resourceContext?: string;

  // Webhook and cron runs carry no triggering person on the token, so an app
  // that knows who the spend belongs to names them here instead.
  @IsOptional()
  @IsUUID()
  userWorkspaceId?: string;
}

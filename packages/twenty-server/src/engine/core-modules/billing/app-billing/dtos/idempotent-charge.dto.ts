/* @license Enterprise */

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';

export class IdempotentChargeDto extends ChargeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  idempotencyKey: string;
}

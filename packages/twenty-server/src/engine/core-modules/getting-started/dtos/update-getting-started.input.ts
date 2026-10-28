import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { GettingStartedStepStatusInput } from 'src/engine/core-modules/getting-started/dtos/getting-started-step-status.input';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

@InputType()
export class UpdateGettingStartedInput {
  @Field(() => GettingStartedStep, { nullable: true })
  @IsOptional()
  @IsEnum(GettingStartedStep)
  selectedStep?: GettingStartedStep | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsISO8601()
  snoozedUntil?: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean | null;

  @Field(() => GettingStartedStepStatusInput, { nullable: true })
  @IsOptional()
  @Type(() => GettingStartedStepStatusInput)
  @ValidateNested()
  stepStatus?: GettingStartedStepStatusInput | null;
}

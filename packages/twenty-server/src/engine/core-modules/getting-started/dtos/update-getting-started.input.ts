import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

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
}

import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsISO8601, IsOptional } from 'class-validator';
import {
  GETTING_STARTED_STEPS,
  type GettingStartedStep,
} from 'twenty-shared/types';

@InputType()
export class UpdateGettingStartedInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(GETTING_STARTED_STEPS)
  completedStep?: GettingStartedStep;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(GETTING_STARTED_STEPS)
  selectedStep?: GettingStartedStep;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsISO8601()
  snoozedUntil?: string | null;
}

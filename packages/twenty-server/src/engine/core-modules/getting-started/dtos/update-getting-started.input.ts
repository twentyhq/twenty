import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsEnum, IsISO8601, IsOptional } from 'class-validator';

import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

@InputType()
export class UpdateGettingStartedInput {
  @Field(() => GettingStartedStepActionKey, { nullable: true })
  @IsOptional()
  @IsEnum(GettingStartedStepActionKey)
  selectedStepActionKey?: GettingStartedStepActionKey | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsISO8601()
  snoozedUntil?: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean | null;

  @Field(() => GettingStartedStepActionKey, { nullable: true })
  @IsOptional()
  @IsEnum(GettingStartedStepActionKey)
  completedStepActionKey?: GettingStartedStepActionKey | null;
}

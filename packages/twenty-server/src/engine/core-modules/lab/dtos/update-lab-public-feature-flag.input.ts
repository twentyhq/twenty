import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty } from 'class-validator';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

@InputType()
export class UpdateLabPublicFeatureFlagInput {
  @Field(() => String)
  @IsNotEmpty()
  publicFeatureFlag: FeatureFlagKey;

  @Field(() => Boolean)
  @IsBoolean()
  value: boolean;
}

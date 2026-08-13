import { Field, ObjectType } from '@nestjs/graphql';

import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';

@ObjectType('OnboardingStepNavigation')
export class OnboardingStepNavigationDTO {
  @Field(() => OnboardingStatus, {
    nullable: true,
    description: 'Onboarding status the user landed on',
  })
  onboardingStatus: OnboardingStatus | null;

  @Field(() => OnboardingStatus, {
    nullable: true,
    description: 'Step the user can go back to from there, if any',
  })
  previousOnboardingStatus: OnboardingStatus | null;
}

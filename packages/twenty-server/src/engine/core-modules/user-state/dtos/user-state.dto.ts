import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserStateOnboardingStepValues } from 'src/engine/core-modules/user-state/enums/values/user-state-onboarding-step-values.enum';

registerEnumType(UserStateOnboardingStepValues, {
  name: 'UserStateOnboardingStepValues',
  description: 'User state onboarding step',
});

@ObjectType('UserState')
export class UserState {
  @Field(() => UserStateOnboardingStepValues, { nullable: true })
  onboardingStep: UserStateOnboardingStepValues | null;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('OnboardingStepSuccess')
export class OnboardingStepSuccessDTO {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}

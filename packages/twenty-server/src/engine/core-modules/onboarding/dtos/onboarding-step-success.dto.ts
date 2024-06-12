import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OnboardingStepSuccess {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}

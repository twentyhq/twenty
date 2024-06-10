import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OnboardingResult {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}

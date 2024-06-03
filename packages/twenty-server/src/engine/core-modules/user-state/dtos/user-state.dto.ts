import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('UserState')
export class UserState {
  @Field(() => Boolean, { nullable: true })
  skipSyncEmailOnboardingStep: boolean | null;
}

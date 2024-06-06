import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkspaceState')
export class WorkspaceState {
  @Field(() => Boolean, { nullable: true })
  skipInviteTeamOnboardingStep: boolean | null;
}

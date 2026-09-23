import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('OnboardingCreditRewards')
export class OnboardingCreditRewardsDTO {
  @Field(() => Float)
  importContactsCredits: number;

  @Field(() => Float)
  installAppsCredits: number;

  @Field(() => Float)
  inviteTeamCredits: number;

  @Field(() => Float)
  enrichmentQualificationCredits: number;

  @Field(() => Float)
  totalCredits: number;

  @Field(() => Int)
  joinedTeammatesCount: number;

  @Field(() => Int)
  pendingInvitationsCount: number;
}

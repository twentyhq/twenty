import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminPanelWorkspaceUsage')
export class AdminPanelWorkspaceUsageDTO {
  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => Float)
  workspaceCreditsUsed: number;

  @Field(() => Float)
  workspaceCreditsGranted: number;

  @Field(() => Float)
  workspaceCreditsRolledOver: number;

  @Field(() => Float)
  workspaceCreditsTotalGranted: number;

  @Field(() => Float)
  workspaceCreditsRemaining: number;

  @Field(() => Float, { nullable: true })
  userCreditsUsed: number | null;
}

import { Field, ObjectType } from '@nestjs/graphql';

// Admin view of a workspace's relationship to a registration's ownership:
// either the settled owner or a pending claim challenge.
@ObjectType('AdminApplicationRegistrationClaim')
export class AdminApplicationRegistrationClaimDTO {
  @Field(() => String)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  workspaceDisplayName: string | null;

  @Field(() => Boolean)
  isOwner: boolean;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;
}

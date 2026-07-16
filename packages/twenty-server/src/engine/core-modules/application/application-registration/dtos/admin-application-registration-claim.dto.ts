import { Field, ObjectType } from '@nestjs/graphql';

// Admin view of the workspace that owns a registration.
@ObjectType('AdminApplicationRegistrationClaim')
export class AdminApplicationRegistrationClaimDTO {
  @Field(() => String)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  workspaceDisplayName: string | null;
}

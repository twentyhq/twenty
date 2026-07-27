import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminApplicationRegistrationClaim')
export class AdminApplicationRegistrationClaimDTO {
  @Field(() => String)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  workspaceDisplayName: string | null;
}

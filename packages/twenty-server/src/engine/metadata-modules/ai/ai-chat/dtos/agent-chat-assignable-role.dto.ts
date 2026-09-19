import { Field, ID, ObjectType } from '@nestjs/graphql';

// The subset of a role a channel admin needs to pick it, served without the
// settings permission the full role query requires.
@ObjectType('AgentChatAssignableRole')
export class AgentChatAssignableRoleDTO {
  @Field(() => ID)
  id: string;

  @Field()
  label: string;

  @Field(() => String, { nullable: true })
  icon: string | null;
}

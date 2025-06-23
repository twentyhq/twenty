import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@InputType()
export class AssignRoleToAgentInput {
  @Field()
  @IsUUID()
  agentId: string;

  @Field()
  @IsUUID()
  roleId: string;
}

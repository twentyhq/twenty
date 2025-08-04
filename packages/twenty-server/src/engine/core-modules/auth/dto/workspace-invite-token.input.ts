import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@ArgsType()
export class WorkspaceInviteTokenInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  inviteToken: string;
}

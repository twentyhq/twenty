import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@ArgsType()
export class WorkspaceInviteHashValidInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  inviteHash: string;
}

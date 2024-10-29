import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class SwitchWorkspaceInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  workspaceId: string;
}

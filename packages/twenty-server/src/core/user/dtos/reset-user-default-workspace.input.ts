import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ResetUserDefaultWorkspaceInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  userId: string;
}

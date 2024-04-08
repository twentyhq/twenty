import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class SaveOrUpdateConnectedAccountInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  handle: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  workspaceMemberId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

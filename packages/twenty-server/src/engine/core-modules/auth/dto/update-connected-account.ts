import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class UpdateConnectedAccountInput {
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

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  connectedAccountId: string;
}

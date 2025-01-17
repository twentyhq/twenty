import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SignUpInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceInviteHash?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspacePersonalInviteToken?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}

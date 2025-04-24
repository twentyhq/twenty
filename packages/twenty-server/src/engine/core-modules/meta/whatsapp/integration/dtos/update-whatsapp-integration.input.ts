import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateWhatsappIntegrationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phoneId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessAccountId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  appId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  appKey?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accessToken?: string;
}

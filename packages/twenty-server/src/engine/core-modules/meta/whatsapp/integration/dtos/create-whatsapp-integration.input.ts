import { Field, ID, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateWhatsappIntegrationInput {
  @Field()
  @IsString()
  label: string;

  @Field()
  @IsString()
  phoneId: string;

  @Field()
  @IsString()
  businessAccountId: string;

  @Field()
  @IsString()
  appId: string;

  @Field()
  @IsString()
  appKey: string;

  @Field()
  @IsString()
  accessToken: string;

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}

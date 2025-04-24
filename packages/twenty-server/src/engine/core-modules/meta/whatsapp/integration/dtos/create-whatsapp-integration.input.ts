import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateWhatsappIntegrationInput {
  @Field()
  @IsString()
  name: string;

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
}

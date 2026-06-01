import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, IsString, IsUUID, Length, MinLength } from 'class-validator';

@InputType()
export class SendEmailCampaignInput {
  @Field(() => String)
  @IsUUID('4')
  emailListId: string;

  @Field(() => String)
  @IsString()
  @Length(1, 998)
  subject: string;

  @Field(() => String)
  @IsString()
  @MinLength(1)
  body: string;

  @Field(() => String)
  @IsEmail()
  fromAddress: string;
}

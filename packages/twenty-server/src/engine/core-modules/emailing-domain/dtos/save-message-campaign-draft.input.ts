import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

@InputType()
export class SaveMessageCampaignDraftInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  campaignId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  listId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  unsubscribeTopicId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 998)
  subject?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  body?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  fromAddress?: string;
}

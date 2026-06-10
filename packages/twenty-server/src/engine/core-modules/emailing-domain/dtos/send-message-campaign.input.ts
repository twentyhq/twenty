import { Field, InputType } from '@nestjs/graphql';

import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator';

@InputType()
export class SendMessageCampaignInput {
  @Field(() => String)
  @IsUUID('4')
  messageTopicId: string;

  // Optional list whose hand-picked members are the recipients (static audience).
  // When omitted, recipients are the people subscribed to the topic.
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  listId?: string;

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

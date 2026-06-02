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
export class SendMessageBroadcastInput {
  @Field(() => String)
  @IsUUID('4')
  messageTopicId: string;

  // Optional Person view (segment) whose filters resolve the recipients.
  // When omitted, recipients are the people subscribed to the topic.
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  recipientViewId?: string;

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

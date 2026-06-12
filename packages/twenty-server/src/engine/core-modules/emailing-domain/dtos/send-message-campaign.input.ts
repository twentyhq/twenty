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
  // The list whose hand-picked members are the recipients (the audience).
  @Field(() => String)
  @IsUUID('4')
  listId: string;

  // Optional topic used to group the unsubscribe: recipients who unsubscribed
  // from this topic are dropped, and the unsubscribe link is scoped to it.
  // When omitted, the unsubscribe is global.
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  messageTopicId?: string;

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

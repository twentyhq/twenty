import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
class MessageInput {
  @Field()
  @IsString()
  integrationId: string;

  @Field()
  @IsString()
  to: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  message?: string;
}

@InputType()
export class SendMessageInput extends MessageInput {
  @Field()
  @IsString()
  type: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fileId?: string;

  @Field()
  @IsString()
  from: string;
}

@InputType()
export class MessageAgent {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  id: string;
}

@InputType()
export class MessageSector extends MessageAgent {}

@InputType()
export class SendEventMessageInput extends MessageInput {
  @Field()
  @IsString()
  eventStatus: string;

  @Field()
  @IsString()
  status: string;

  @Field()
  @IsString()
  from: string;

  @Field()
  @IsString()
  type: string;

  @Field(() => MessageAgent, { nullable: true })
  @IsOptional()
  agent?: MessageAgent;

  @Field(() => MessageSector, { nullable: true })
  @IsOptional()
  sector?: MessageSector;
}

@InputType()
export class SendTemplateInput {
  @Field()
  @IsString()
  integrationId: string;

  @Field()
  @IsString()
  to: string;

  @Field()
  @IsString()
  templateName: string;

  @Field()
  @IsString()
  language: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => MessageAgent, { nullable: true })
  @IsOptional()
  agent?: MessageAgent;
}

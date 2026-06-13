import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { MessageTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/message-topic-visibility.type';

@InputType()
export class CreateMessageTopicInput {
  @Field(() => String)
  @IsString()
  @MaxLength(256)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;

  @Field(() => MessageTopicVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(MessageTopicVisibility)
  visibility?: MessageTopicVisibility;
}

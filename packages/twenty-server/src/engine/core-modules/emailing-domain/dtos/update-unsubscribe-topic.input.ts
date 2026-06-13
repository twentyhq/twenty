import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UnsubscribeTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-topic-visibility.type';

@InputType()
export class UpdateUnsubscribeTopicInput {
  @Field(() => String)
  @IsUUID('4')
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;

  @Field(() => UnsubscribeTopicVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(UnsubscribeTopicVisibility)
  visibility?: UnsubscribeTopicVisibility;
}

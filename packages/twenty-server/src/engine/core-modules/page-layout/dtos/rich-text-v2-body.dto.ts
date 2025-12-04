import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';
import { type RichTextV2Metadata } from 'twenty-shared/types';

@ObjectType('RichTextV2Body')
export class RichTextV2BodyDTO implements RichTextV2Metadata {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  blocknote?: string | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  markdown: string | null;
}

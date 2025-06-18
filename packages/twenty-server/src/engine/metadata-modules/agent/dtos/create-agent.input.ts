import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateAgentInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  modelId: string;

  @IsString()
  @Field(() => String)
  responseFormat: string;
}

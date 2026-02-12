import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

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
  version: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  sourcePath: string;
}

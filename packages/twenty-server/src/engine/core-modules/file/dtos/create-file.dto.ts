import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateFileDTO {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  fullPath: string;

  @Field()
  @IsNumber()
  size: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  type: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  workspaceId: string;
}

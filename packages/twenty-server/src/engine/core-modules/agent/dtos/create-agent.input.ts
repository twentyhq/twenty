import { Field, ID, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateAgentInput {
  @Field(() => ID)
  @IsString()
  memberId: string;

  @Field()
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field(() => [String])
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  sectorIds: string[];
}

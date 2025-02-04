import { Field, ID, InputType } from '@nestjs/graphql';

import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
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
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  sectorIds: string[];

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  inboxesIds: string[];
}

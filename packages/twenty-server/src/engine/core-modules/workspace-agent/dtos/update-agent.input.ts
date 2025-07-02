import { Field, ID, InputType } from '@nestjs/graphql';

import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateWorkspaceAgentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field(() => ID)
  @IsString()
  memberId: string;

  @Field()
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

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

import { Field, HideField, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateFrontComponentInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @HideField()
  builtComponentChecksum?: string;
}

@InputType()
export class UpdateFrontComponentInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the front component to update',
  })
  id: string;

  @Type(() => UpdateFrontComponentInputUpdates)
  @ValidateNested()
  @Field(() => UpdateFrontComponentInputUpdates, {
    description: 'The front component fields to update',
  })
  update: UpdateFrontComponentInputUpdates;
}

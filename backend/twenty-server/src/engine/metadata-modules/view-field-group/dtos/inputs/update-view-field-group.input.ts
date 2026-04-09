import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
class UpdateViewFieldGroupInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  deletedAt?: string;
}

@InputType()
export class UpdateViewFieldGroupInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view field group to update',
  })
  id: string;

  @Type(() => UpdateViewFieldGroupInputUpdates)
  @ValidateNested()
  @Field(() => UpdateViewFieldGroupInputUpdates, {
    description: 'The view field group to update',
  })
  update: UpdateViewFieldGroupInputUpdates;
}

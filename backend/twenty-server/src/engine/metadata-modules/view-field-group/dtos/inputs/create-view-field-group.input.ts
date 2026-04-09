import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateViewFieldGroupInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsNotEmpty()
  @IsString()
  @Field({ nullable: false })
  name: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: true })
  isVisible?: boolean;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}

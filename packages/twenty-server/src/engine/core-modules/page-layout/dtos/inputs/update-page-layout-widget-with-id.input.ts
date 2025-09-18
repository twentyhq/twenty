import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { GridPositionInput } from 'src/engine/core-modules/page-layout/dtos/inputs/grid-position.input';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';

@InputType()
export class UpdatePageLayoutWidgetWithIdInput {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsNotEmpty()
  pageLayoutTabId: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => WidgetType, { nullable: true })
  @IsEnum(WidgetType)
  @IsNotEmpty()
  type: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId: string | null;

  @Field(() => GridPositionInput, { nullable: true })
  @ValidateNested()
  @Type(() => GridPositionInput)
  @IsNotEmpty()
  gridPosition: GridPositionInput;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsNotEmpty()
  configuration: Record<string, unknown> | null;
}

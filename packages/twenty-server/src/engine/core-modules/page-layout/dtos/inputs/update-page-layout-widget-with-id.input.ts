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
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  pageLayoutTabId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => WidgetType)
  @IsEnum(WidgetType)
  @IsNotEmpty()
  type: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId: string | null;

  @Field(() => GridPositionInput)
  @ValidateNested()
  @Type(() => GridPositionInput)
  @IsNotEmpty()
  gridPosition: GridPositionInput;

  @Field(() => GraphQLJSON)
  @IsObject()
  @IsOptional()
  configuration: Record<string, unknown> | null;
}

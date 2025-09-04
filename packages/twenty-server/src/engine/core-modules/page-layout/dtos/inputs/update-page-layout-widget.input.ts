import { Field, InputType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { GridPositionInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdatePageLayoutWidgetInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => WidgetType, { nullable: true })
  @IsEnum(WidgetType)
  @IsOptional()
  type?: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId?: string | null;

  @Field(() => GridPositionInput, { nullable: true })
  @ValidateNested()
  @Type(() => GridPositionInput)
  @IsOptional()
  gridPosition?: GridPositionInput;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  configuration?: Record<string, unknown> | null;
}

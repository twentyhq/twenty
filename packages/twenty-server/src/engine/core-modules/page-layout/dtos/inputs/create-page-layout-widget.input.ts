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
export class CreatePageLayoutWidgetInput {
  @Field(() => UUIDScalarType, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  pageLayoutTabId: string;

  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => WidgetType, { nullable: true, defaultValue: WidgetType.VIEW })
  @IsEnum(WidgetType)
  @IsOptional()
  type?: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId?: string | null;

  @Field(() => GridPositionInput, { nullable: false })
  @ValidateNested()
  @Type(() => GridPositionInput)
  gridPosition: GridPositionInput;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  configuration?: Record<string, unknown> | null;
}

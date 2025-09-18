import { Field, Float, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget-with-id.input';

@InputType()
export class UpdatePageLayoutTabWithWidgetsInput {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsNotEmpty()
  position: number;

  @Field(() => [UpdatePageLayoutWidgetWithIdInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePageLayoutWidgetWithIdInput)
  @IsNotEmpty()
  widgets: UpdatePageLayoutWidgetWithIdInput[];
}

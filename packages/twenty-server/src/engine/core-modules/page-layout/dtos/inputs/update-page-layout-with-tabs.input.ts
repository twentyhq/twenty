import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';

@InputType()
export class UpdatePageLayoutWithTabsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => PageLayoutType)
  @IsEnum(PageLayoutType)
  @IsNotEmpty()
  type: PageLayoutType;

  @Field(() => UUIDScalarType)
  @IsUUID()
  objectMetadataId: string | null;

  @Field(() => [UpdatePageLayoutTabWithWidgetsInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePageLayoutTabWithWidgetsInput)
  tabs: UpdatePageLayoutTabWithWidgetsInput[];
}

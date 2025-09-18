import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
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
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => PageLayoutType, { nullable: true })
  @IsEnum(PageLayoutType)
  @IsNotEmpty()
  type: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  objectMetadataId: string | null;

  @Field(() => [UpdatePageLayoutTabWithWidgetsInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePageLayoutTabWithWidgetsInput)
  @IsNotEmpty()
  tabs: UpdatePageLayoutTabWithWidgetsInput[];
}

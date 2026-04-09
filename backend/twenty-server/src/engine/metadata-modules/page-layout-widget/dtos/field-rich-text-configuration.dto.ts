import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type FieldRichTextConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('FieldRichTextConfiguration')
export class FieldRichTextConfigurationDTO
  implements FieldRichTextConfiguration
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.FIELD_RICH_TEXT])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.FIELD_RICH_TEXT;
}

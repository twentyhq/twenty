import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type WorkflowVersionConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('WorkflowVersionConfiguration')
export class WorkflowVersionConfigurationDTO
  implements WorkflowVersionConfiguration
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.WORKFLOW_VERSION])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.WORKFLOW_VERSION;
}

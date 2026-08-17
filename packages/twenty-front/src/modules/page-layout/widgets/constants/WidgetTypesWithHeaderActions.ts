import { WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE } from '@/page-layout/widgets/constants/WidgetHeaderActionComponentByWidgetType';
import { type WidgetType } from '~/generated-metadata/graphql';

export const WIDGET_TYPES_WITH_HEADER_ACTIONS = Object.keys(
  WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE,
) as WidgetType[];

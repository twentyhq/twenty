import { WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE } from '@/page-layout/widgets/constants/WidgetHeaderActionComponentByWidgetType';
import { WidgetType } from '~/generated-metadata/graphql';

// Gates solo-header visibility; FIELD stays out so solo field widget headers
// keep their pre-existing hidden-until-count default.
export const WIDGET_TYPES_WITH_HEADER_ACTIONS: WidgetType[] = (
  Object.keys(WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE) as WidgetType[]
).filter((widgetType) => widgetType !== WidgetType.FIELD);

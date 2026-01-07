import { type WidgetSizeConfig } from '@/page-layout/types/WidgetSizeConfig';
import { WidgetConfigurationType } from '~/generated/graphql';

export const GRAPH_WIDGET_SIZES: Partial<
  Record<WidgetConfigurationType, WidgetSizeConfig>
> = {
  [WidgetConfigurationType.AGGREGATE_CHART]: {
    default: { w: 2, h: 2 },
    minimum: { w: 2, h: 2 },
  },
  [WidgetConfigurationType.GAUGE_CHART]: {
    default: { w: 3, h: 4 },
    minimum: { w: 3, h: 4 },
  },
  [WidgetConfigurationType.PIE_CHART]: {
    default: { w: 4, h: 4 },
    minimum: { w: 3, h: 4 },
  },
  [WidgetConfigurationType.BAR_CHART]: {
    default: { w: 6, h: 6 },
    minimum: { w: 4, h: 4 },
  },
  [WidgetConfigurationType.LINE_CHART]: {
    default: { w: 6, h: 10 },
    minimum: { w: 4, h: 4 },
  },
};

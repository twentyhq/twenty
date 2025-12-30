import { DEFAULT_WIDGET_SIZE } from '@/page-layout/constants/DefaultWidgetSize';
import { GRAPH_WIDGET_SIZES } from '@/page-layout/constants/GraphWidgetSizes';
import { type WidgetConfigurationType } from '~/generated/graphql';

export const getWidgetSize = (
  configurationType: WidgetConfigurationType,
  type: 'default' | 'minimum',
): { w: number; h: number } => {
  const sizeConfig =
    GRAPH_WIDGET_SIZES[configurationType] ?? DEFAULT_WIDGET_SIZE;
  return sizeConfig[type];
};

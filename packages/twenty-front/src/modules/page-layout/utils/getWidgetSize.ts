import { DEFAULT_WIDGET_SIZE } from '@/page-layout/constants/DefaultWidgetSize';
import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { type GraphType } from '~/generated/graphql';

export const getWidgetSize = (
  graphType: GraphType,
  type: 'default' | 'minimum',
): { w: number; h: number } => {
  const sizeConfig = WIDGET_SIZES[graphType] ?? DEFAULT_WIDGET_SIZE;
  return sizeConfig[type];
};

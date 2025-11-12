import { type WidgetSizeConfig } from '@/page-layout/types/WidgetSizeConfig';
import { WidgetType } from '~/generated/graphql';

export const WIDGET_SIZES: Partial<Record<WidgetType, WidgetSizeConfig>> = {
  [WidgetType.IFRAME]: {
    default: { w: 6, h: 6 },
    minimum: { w: 4, h: 5 },
  },
};

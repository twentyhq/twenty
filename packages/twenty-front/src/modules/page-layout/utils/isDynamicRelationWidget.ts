import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const DYNAMIC_RELATION_WIDGET_ID_PREFIX = 'dynamic-relation-widget-';

export const isDynamicRelationWidget = (widget: PageLayoutWidget): boolean => {
  return widget.id.startsWith(DYNAMIC_RELATION_WIDGET_ID_PREFIX);
};

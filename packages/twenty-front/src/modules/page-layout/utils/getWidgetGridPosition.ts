import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const getWidgetGridPosition = (widget: PageLayoutWidget) =>
  widget.position?.__typename === 'PageLayoutWidgetGridPosition'
    ? widget.position
    : (widget.gridPosition ?? undefined);

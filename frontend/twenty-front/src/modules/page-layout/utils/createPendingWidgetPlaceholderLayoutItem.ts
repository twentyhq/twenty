import { DEFAULT_WIDGET_SIZE } from '@/page-layout/constants/DefaultWidgetSize';
import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import { type Layout } from 'react-grid-layout';

export const createPendingWidgetPlaceholderLayoutItem = (
  draggedArea: { x: number; y: number; w: number; h: number },
  breakpoint: 'desktop' | 'mobile',
): Layout => ({
  i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
  x: breakpoint === 'mobile' ? 0 : draggedArea.x,
  y: draggedArea.y,
  w:
    breakpoint === 'mobile'
      ? 1
      : Math.max(draggedArea.w, DEFAULT_WIDGET_SIZE.default.w),
  h: Math.max(draggedArea.h, DEFAULT_WIDGET_SIZE.default.h),
  minW: DEFAULT_WIDGET_SIZE.minimum.w,
  minH: DEFAULT_WIDGET_SIZE.minimum.h,
  static: false,
});

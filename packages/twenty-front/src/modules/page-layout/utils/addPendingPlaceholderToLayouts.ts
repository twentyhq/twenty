import { createPendingWidgetPlaceholderLayoutItem } from '@/page-layout/utils/createPendingWidgetPlaceholderLayoutItem';
import { type ResponsiveLayouts } from 'react-grid-layout';

export const addPendingPlaceholderToLayouts = (
  baseLayouts: ResponsiveLayouts,
  draggedArea: { x: number; y: number; w: number; h: number },
): ResponsiveLayouts => ({
  desktop: [
    ...(baseLayouts.desktop ?? []),
    createPendingWidgetPlaceholderLayoutItem(draggedArea, 'desktop'),
  ],
  mobile: [
    ...(baseLayouts.mobile ?? []),
    createPendingWidgetPlaceholderLayoutItem(draggedArea, 'mobile'),
  ],
});

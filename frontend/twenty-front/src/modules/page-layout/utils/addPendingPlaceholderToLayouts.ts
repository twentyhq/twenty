import { createPendingWidgetPlaceholderLayoutItem } from '@/page-layout/utils/createPendingWidgetPlaceholderLayoutItem';
import { type Layouts } from 'react-grid-layout';

export const addPendingPlaceholderToLayouts = (
  baseLayouts: Layouts,
  draggedArea: { x: number; y: number; w: number; h: number },
): Layouts => ({
  desktop: [
    ...(baseLayouts.desktop ?? []),
    createPendingWidgetPlaceholderLayoutItem(draggedArea, 'desktop'),
  ],
  mobile: [
    ...(baseLayouts.mobile ?? []),
    createPendingWidgetPlaceholderLayoutItem(draggedArea, 'mobile'),
  ],
});

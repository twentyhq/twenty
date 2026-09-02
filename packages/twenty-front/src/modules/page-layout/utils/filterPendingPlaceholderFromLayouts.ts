import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import { type ResponsiveLayouts } from 'react-grid-layout';

export const filterPendingPlaceholderFromLayouts = (
  layouts: ResponsiveLayouts,
): ResponsiveLayouts => ({
  desktop: layouts.desktop?.filter(
    (layoutItem) => layoutItem.i !== PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
  ),
  mobile: layouts.mobile?.filter(
    (layoutItem) => layoutItem.i !== PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
  ),
});

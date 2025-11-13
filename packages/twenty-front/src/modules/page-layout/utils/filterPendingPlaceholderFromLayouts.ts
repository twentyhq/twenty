import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import { type Layouts } from 'react-grid-layout';

export const filterPendingPlaceholderFromLayouts = (
  layouts: Layouts,
): Layouts => ({
  desktop: layouts.desktop?.filter(
    (layoutItem) => layoutItem.i !== PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
  ),
  mobile: layouts.mobile?.filter(
    (layoutItem) => layoutItem.i !== PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
  ),
});

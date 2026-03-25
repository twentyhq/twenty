import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import { type GridLayoutItem } from '@/page-layout/types/GridLayoutItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';

export const prepareGridLayoutItemsWithPlaceholders = (
  widgets: PageLayoutWidget[] | undefined,
  shouldIncludePendingPlaceholder: boolean,
): GridLayoutItem[] => {
  const hasWidgets = isDefined(widgets) && widgets.length > 0;

  if (!hasWidgets) {
    if (shouldIncludePendingPlaceholder) {
      return [
        {
          id: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
          type: 'placeholder' as const,
        },
      ];
    }

    return [
      {
        id: 'empty-placeholder',
        type: 'placeholder' as const,
      },
    ];
  }

  const gridLayoutItems: GridLayoutItem[] = widgets.map((widget) => ({
    id: widget.id,
    type: 'widget' as const,
    widget,
  }));

  if (shouldIncludePendingPlaceholder) {
    gridLayoutItems.push({
      id: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
      type: 'placeholder' as const,
    });
  }

  return gridLayoutItems;
};

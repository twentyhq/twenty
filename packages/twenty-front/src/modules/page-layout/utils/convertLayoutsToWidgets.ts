import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type Layouts } from 'react-grid-layout';

export const convertLayoutsToWidgets = (
  widgets: PageLayoutWidget[],
  layouts: Layouts,
): PageLayoutWidget[] => {
  const activeLayouts = layouts.desktop || layouts.mobile || [];

  return widgets.map((widget) => {
    const layout = activeLayouts.find((l) => l.i === widget.id);

    return {
      ...widget,
      gridPosition: {
        row: layout?.y ?? 0,
        column: layout?.x ?? 0,
        rowSpan: layout?.h ?? 2,
        columnSpan: layout?.w ?? 2,
      },
    };
  });
};

import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { type Layouts } from 'react-grid-layout';

export const convertLayoutsToWidgets = (
  widgets: PageLayoutWidgetWithData[],
  layouts: Layouts,
): PageLayoutWidgetWithData[] => {
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

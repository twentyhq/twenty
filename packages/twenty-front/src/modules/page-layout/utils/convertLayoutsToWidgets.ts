import { type Widget } from '@/page-layout/widgets/types/Widget';
import { type Layouts } from 'react-grid-layout';

export const convertLayoutsToWidgets = (
  widgets: Widget[],
  layouts: Layouts,
): Widget[] => {
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

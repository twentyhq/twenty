import { type Layouts } from 'react-grid-layout';
import { type Widget } from '../mocks/mockWidgets';

export type WidgetWithGridPosition = Widget & {
  gridPosition: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  };
};

export const convertLayoutsToWidgets = (
  widgets: Widget[],
  layouts: Layouts,
): WidgetWithGridPosition[] => {
  const lgLayouts = layouts.lg || layouts.desktop || [];

  return widgets.map((widget) => {
    const layout = lgLayouts.find((l) => l.i === widget.id);
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

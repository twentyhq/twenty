import { type Layouts } from 'react-grid-layout';
import { type WidgetWithGridPosition } from './convertLayoutsToWidgets';

export const convertWidgetsToLayouts = (
  widgets: WidgetWithGridPosition[],
): Layouts => {
  const layouts = widgets.map((w) => ({
    i: w.id,
    x: w.gridPosition.column,
    y: w.gridPosition.row,
    w: w.gridPosition.columnSpan,
    h: w.gridPosition.rowSpan,
  }));

  return {
    lg: layouts,
    md: layouts,
    sm: layouts.map((l) => ({ ...l, w: 1, x: 0 })),
  };
};

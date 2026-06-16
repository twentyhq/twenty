import { type Layout, type Layouts } from 'react-grid-layout';

// The catalog of dashboard widgets + the default arrangement. Kept data-only so
// both the grid renderer and the (future) "add widget" picker share one source of
// truth. Widget ids are stable strings — they key the react-grid-layout items AND
// the persisted layout, so they must never change once shipped.
export type WidgetId =
  | 'kpi-sent'
  | 'kpi-openRate'
  | 'kpi-replies'
  | 'kpi-revenue'
  | 'trend'
  | 'channels'
  | 'funnel'
  | 'attention'
  | 'sendingNow';

export interface WidgetDef {
  id: WidgetId;
  title: string;
  // Minimum grid cells, used when (re)adding a widget so it never spawns tiny.
  minW: number;
  minH: number;
}

export const WIDGET_CATALOG: WidgetDef[] = [
  { id: 'kpi-sent', title: 'Sent', minW: 2, minH: 2 },
  { id: 'kpi-openRate', title: 'Open rate', minW: 2, minH: 2 },
  { id: 'kpi-replies', title: 'Replies', minW: 2, minH: 2 },
  { id: 'kpi-revenue', title: 'Revenue', minW: 2, minH: 2 },
  { id: 'trend', title: 'Sends over time', minW: 4, minH: 4 },
  { id: 'channels', title: 'Channel mix', minW: 3, minH: 4 },
  { id: 'funnel', title: 'Funnel', minW: 3, minH: 4 },
  { id: 'attention', title: 'Needs attention', minW: 4, minH: 4 },
  { id: 'sendingNow', title: 'Sending now', minW: 4, minH: 4 },
];

export const ALL_WIDGET_IDS: WidgetId[] = WIDGET_CATALOG.map((w) => w.id);

export const GRID_COLS = { lg: 12, md: 12, sm: 6, xs: 2 } as const;
export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 } as const;
export const GRID_ROW_HEIGHT = 80;
export const GRID_MARGIN: [number, number] = [16, 16];

// Default lg layout: 4 KPI tiles across the top, a wide trend chart with the
// channel donut beside it, the funnel under the donut, then attention + sending
// across the bottom. md mirrors lg; sm/xs let react-grid-layout reflow into the
// narrower column counts (we only seed lg/md; the grid derives the rest).
const DEFAULT_LG: Layout[] = [
  { i: 'kpi-sent', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-openRate', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-replies', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-revenue', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'trend', x: 0, y: 2, w: 8, h: 5, minW: 4, minH: 4 },
  { i: 'channels', x: 8, y: 2, w: 4, h: 5, minW: 3, minH: 4 },
  { i: 'funnel', x: 8, y: 7, w: 4, h: 5, minW: 3, minH: 4 },
  { i: 'attention', x: 0, y: 7, w: 4, h: 5, minW: 4, minH: 4 },
  { i: 'sendingNow', x: 4, y: 7, w: 4, h: 5, minW: 4, minH: 4 },
];

export const DEFAULT_LAYOUTS: Layouts = {
  lg: DEFAULT_LG,
  md: DEFAULT_LG.map((item) => ({ ...item })),
};

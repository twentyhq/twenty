export type GridPosition = {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};

export type PageLayoutWidget = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  type: string;
  objectMetadataId: string | null;
  gridPosition: GridPosition;
  // Heterogeneous per widget type (chart config, table config, ...) - only the field/view
  // reference keys relevant to migration are read; see find-page-layouts.util.ts's query.
  configuration: Record<string, unknown>;
};

export type PageLayoutTab = {
  id: string;
  title: string;
  position: number;
  layoutMode: string | null;
  widgets: PageLayoutWidget[];
};

export type PageLayout = {
  id: string;
  name: string;
  type: string;
  objectMetadataId: string | null;
  // RECORD_PAGE layouts are auto-provisioned (isSystemSideEffect: true) whenever the object
  // itself is created; only non-system ones represent actual user customization worth
  // migrating. DASHBOARD layouts are always non-system (one is created fresh per Dashboard).
  isSystemSideEffect: boolean;
  tabs: PageLayoutTab[];
};

export type Dashboard = {
  id: string;
  title: string;
  pageLayoutId: string;
  position: number;
};

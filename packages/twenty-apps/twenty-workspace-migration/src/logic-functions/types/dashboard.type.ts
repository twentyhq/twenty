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
  // True for the one default widget every system tab is provisioned with (see PageLayoutTab.
  // isSystemSideEffect) - anything a user added on top of it is false.
  isSystemSideEffect: boolean;
};

export type PageLayoutTab = {
  id: string;
  title: string;
  position: number;
  layoutMode: string | null;
  widgets: PageLayoutWidget[];
  // True for the 5 tabs (home/timeline/tasks/notes/files) every RECORD_PAGE layout is
  // auto-provisioned with - a tab a user added directly is false, same idea as the layout-level
  // flag but one level down, since a system layout can still carry user-added tabs/widgets.
  isSystemSideEffect: boolean;
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

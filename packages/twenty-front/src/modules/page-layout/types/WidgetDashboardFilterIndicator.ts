export type WidgetDashboardFilterIndicator = {
  pageLayoutFilterId: string;
  label: string;
} & (
  | { kind: 'OVERRIDE'; fieldLabel: string }
  | { kind: 'IGNORED' | 'UNRESOLVED' }
);

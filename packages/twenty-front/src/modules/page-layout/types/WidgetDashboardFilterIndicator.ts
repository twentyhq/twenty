export type WidgetDashboardFilterIndicator = {
  pageLayoutFilterId: string;
  label: string;
} & (
  | { kind: 'APPLIED'; fieldLabel: string; hasValue: false }
  | {
      kind: 'APPLIED';
      fieldLabel: string;
      hasValue: true;
      overlapsWidgetFilter: boolean;
    }
  | { kind: 'IGNORED' | 'UNAVAILABLE' | 'NO_DATE_FIELD'; hasValue: boolean }
);

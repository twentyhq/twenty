import { type DashboardFilterWidgetFilter } from '@/page-layout/types/DashboardFilterWidgetFilter';

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
      replacedWidgetConditions: Pick<
        DashboardFilterWidgetFilter['recordFilters'][number],
        'operand' | 'value'
      >[];
    }
  | { kind: 'IGNORED' | 'UNAVAILABLE' | 'NO_DATE_FIELD'; hasValue: boolean }
);

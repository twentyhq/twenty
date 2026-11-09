import { type DashboardFilterValue } from 'twenty-shared/types';

export type WidgetDashboardFilterIndicator = {
  pageLayoutFilterId: string;
  label: string;
  value: DashboardFilterValue;
  // null when the widget is not filtered by it
  fieldLabel: string | null;
};

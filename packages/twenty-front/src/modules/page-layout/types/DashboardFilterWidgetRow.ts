import { type DashboardFilterWidgetSetting } from '@/page-layout/types/DashboardFilterWidgetSetting';

export type DashboardFilterWidgetRow = DashboardFilterWidgetSetting & {
  widgetId: string;
  widgetTitle: string;
  tabTitle: string | null;
  isReadOnly: boolean;
};

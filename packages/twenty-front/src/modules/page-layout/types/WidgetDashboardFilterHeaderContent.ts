import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';

export type WidgetDashboardFilterPill = {
  pageLayoutFilterId: string;
  kind: 'IGNORED' | 'UNAVAILABLE' | 'NO_DATE_FIELD' | 'OVERLAP';
  text: string;
  tooltip: string;
};

export type WidgetDashboardFilterHeaderContent = {
  fieldLabels: {
    pageLayoutFilterId: string;
    kind: WidgetDashboardFilterIndicator['kind'];
    text: string;
    fullText: string;
  }[];
  pills: WidgetDashboardFilterPill[];
  hoverIndicatorText: string | null;
};

import { SidePanelPages } from 'twenty-shared/types';

import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';

const PAGE_LAYOUT_SIDE_PANEL_PAGES: PageLayoutSidePanelPage[] = [
  SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
  SidePanelPages.PageLayoutTabSettings,
  SidePanelPages.DashboardChartSettings,
  SidePanelPages.DashboardIframeSettings,
  SidePanelPages.DashboardRecordTableSettings,
  SidePanelPages.RecordPageFieldsSettings,
  SidePanelPages.RecordPageFieldSettings,
  SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
];

export const isPageLayoutSidePanelPage = (
  page: SidePanelPages,
): page is PageLayoutSidePanelPage => {
  return (PAGE_LAYOUT_SIDE_PANEL_PAGES as SidePanelPages[]).includes(page);
};

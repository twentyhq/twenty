import { isPageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/utils/isPageLayoutSidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';

describe('isPageLayoutSidePanelPage', () => {
  const pageLayoutPages: SidePanelPages[] = [
    SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
    SidePanelPages.PageLayoutTabSettings,
    SidePanelPages.DashboardChartSettings,
    SidePanelPages.DashboardIframeSettings,
    SidePanelPages.DashboardRecordTableSettings,
    SidePanelPages.RecordPageFieldsSettings,
    SidePanelPages.RecordPageFieldSettings,
    SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
  ];

  it.each(pageLayoutPages)(
    'should return true for page layout page: %s',
    (page) => {
      expect(isPageLayoutSidePanelPage(page)).toBe(true);
    },
  );

  const nonPageLayoutPages: SidePanelPages[] = [
    SidePanelPages.ViewRecord,
    SidePanelPages.AskAI,
    SidePanelPages.ComposeEmail,
    SidePanelPages.SearchRecords,
    SidePanelPages.ViewFrontComponent,
  ];

  it.each(nonPageLayoutPages)(
    'should return false for non-page-layout page: %s',
    (page) => {
      expect(isPageLayoutSidePanelPage(page)).toBe(false);
    },
  );
});

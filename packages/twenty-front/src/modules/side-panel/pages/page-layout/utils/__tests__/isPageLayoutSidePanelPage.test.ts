import { type SidePanelRegularPage } from '@/side-panel/constants/SidePanelArtifactPage';
import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { isPageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/utils/isPageLayoutSidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';

describe('isPageLayoutSidePanelPage', () => {
  const pageLayoutPages: PageLayoutSidePanelPage[] = [
    SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
    SidePanelPages.PageLayoutTabSettings,
    SidePanelPages.PageLayoutWidgetSettings,
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

  const nonPageLayoutPages: SidePanelRegularPage[] = [
    SidePanelPages.CommandMenuDisplay,
    SidePanelPages.AskAI,
    SidePanelPages.ComposeCalendarEvent,
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

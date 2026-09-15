import { getReplaceWidgetSidePanelPage } from '@/side-panel/pages/page-layout/utils/getReplaceWidgetSidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

describe('getReplaceWidgetSidePanelPage', () => {
  it('routes dashboards to the dashboard widget picker', () => {
    expect(getReplaceWidgetSidePanelPage(PageLayoutType.DASHBOARD)).toBe(
      SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
    );
  });

  it('routes record pages to the record-page widget picker', () => {
    expect(getReplaceWidgetSidePanelPage(PageLayoutType.RECORD_PAGE)).toBe(
      SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    );
  });
});

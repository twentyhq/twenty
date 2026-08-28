import { getPageLayoutIcon } from '@/side-panel/pages/page-layout/utils/getPageLayoutIcon';
import { SidePanelPages } from 'twenty-shared/types';
import {
  IconAppWindow,
  IconChartPie,
  IconFrame,
  IconLayoutDashboard,
  IconListDetails,
  IconPerspective,
  IconPlus,
  IconTable,
} from 'twenty-ui/icon';

describe('getPageLayoutIcon', () => {
  it.each([
    [SidePanelPages.PageLayoutDashboardWidgetTypeSelect, IconAppWindow],
    [SidePanelPages.DashboardChartSettings, IconChartPie],
    [SidePanelPages.DashboardIframeSettings, IconFrame],
    [SidePanelPages.PageLayoutTabSettings, IconPerspective],
    [SidePanelPages.PageLayoutWidgetSettings, IconLayoutDashboard],
    [SidePanelPages.RecordPageFieldsSettings, IconListDetails],
    [SidePanelPages.RecordPageFieldSettings, IconListDetails],
    [SidePanelPages.DashboardRecordTableSettings, IconTable],
    [SidePanelPages.PageLayoutRecordPageWidgetTypeSelect, IconPlus],
  ] as const)('returns the expected icon for %s', (page, expectedIcon) => {
    expect(getPageLayoutIcon(page)).toBe(expectedIcon);
  });
});

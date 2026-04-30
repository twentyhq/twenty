import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconChartPie,
  IconFrame,
  IconList,
  IconPlus,
  IconTable,
} from 'twenty-ui/display';

export const getPageLayoutIcon = (page: PageLayoutSidePanelPage) => {
  switch (page) {
    case SidePanelPages.PageLayoutDashboardWidgetTypeSelect:
      return IconAppWindow;
    case SidePanelPages.DashboardChartSettings:
      return IconChartPie;
    case SidePanelPages.DashboardIframeSettings:
      return IconFrame;
    case SidePanelPages.PageLayoutTabSettings:
      return IconAppWindow;
    case SidePanelPages.RecordPageFieldsSettings:
      return IconList;
    case SidePanelPages.RecordPageFieldSettings:
      return IconList;
    case SidePanelPages.DashboardRecordTableSettings:
      return IconTable;
    case SidePanelPages.PageLayoutRecordPageWidgetTypeSelect:
      return IconPlus;
    default:
      assertUnreachable(page);
  }
};

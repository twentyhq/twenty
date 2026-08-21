import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconChartPie,
  IconFrame,
  IconListDetails,
  IconPerspective,
  IconPlus,
  IconTable,
} from 'twenty-ui/icon';

export const getPageLayoutIcon = (page: PageLayoutSidePanelPage) => {
  switch (page) {
    case SidePanelPages.PageLayoutDashboardWidgetTypeSelect:
      return IconAppWindow;
    case SidePanelPages.DashboardChartSettings:
      return IconChartPie;
    case SidePanelPages.DashboardIframeSettings:
      return IconFrame;
    case SidePanelPages.PageLayoutTabSettings:
      return IconPerspective;
    case SidePanelPages.RecordPageFieldsSettings:
      return IconListDetails;
    case SidePanelPages.RecordPageFieldSettings:
      return IconListDetails;
    case SidePanelPages.DashboardRecordTableSettings:
      return IconTable;
    case SidePanelPages.PageLayoutRecordPageWidgetTypeSelect:
      return IconPlus;
    default:
      assertUnreachable(page);
  }
};

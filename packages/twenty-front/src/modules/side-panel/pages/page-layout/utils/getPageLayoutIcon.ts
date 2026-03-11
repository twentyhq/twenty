import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconChartPie,
  IconFrame,
  IconList,
} from 'twenty-ui/display';

export const getPageLayoutIcon = (page: PageLayoutSidePanelPage) => {
  switch (page) {
    case SidePanelPages.PageLayoutWidgetTypeSelect:
      return IconAppWindow;
    case SidePanelPages.PageLayoutGraphTypeSelect:
      return IconChartPie;
    case SidePanelPages.PageLayoutIframeSettings:
      return IconFrame;
    case SidePanelPages.PageLayoutTabSettings:
      return IconAppWindow;
    case SidePanelPages.PageLayoutFieldsSettings:
      return IconList;
    default:
      assertUnreachable(page);
  }
};

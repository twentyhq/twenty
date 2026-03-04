import { type PageLayoutCommandMenuPage } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPage';
import { SidePanelPages } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconChartPie,
  IconFilter,
  IconFrame,
  IconLayoutSidebarRight,
  IconList,
} from 'twenty-ui/display';

export const getPageLayoutIcon = (page: PageLayoutCommandMenuPage) => {
  switch (page) {
    case SidePanelPages.PageLayoutWidgetTypeSelect:
      return IconAppWindow;
    case SidePanelPages.PageLayoutGraphTypeSelect:
      return IconChartPie;
    case SidePanelPages.PageLayoutIframeSettings:
      return IconFrame;
    case SidePanelPages.PageLayoutGraphFilter:
      return IconFilter;
    case SidePanelPages.PageLayoutTabSettings:
      return IconAppWindow;
    case SidePanelPages.PageLayoutFieldsSettings:
      return IconList;
    case SidePanelPages.PageLayoutFieldsLayout:
      return IconLayoutSidebarRight;
    default:
      assertUnreachable(page);
  }
};

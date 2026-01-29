import { type PageLayoutCommandMenuPage } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPage';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
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
    case CommandMenuPages.PageLayoutWidgetTypeSelect:
      return IconAppWindow;
    case CommandMenuPages.PageLayoutGraphTypeSelect:
      return IconChartPie;
    case CommandMenuPages.PageLayoutIframeSettings:
      return IconFrame;
    case CommandMenuPages.PageLayoutGraphFilter:
      return IconFilter;
    case CommandMenuPages.PageLayoutTabSettings:
      return IconAppWindow;
    case CommandMenuPages.PageLayoutFieldsSettings:
      return IconList;
    case CommandMenuPages.PageLayoutFieldsLayout:
      return IconLayoutSidebarRight;
    default:
      assertUnreachable(page);
  }
};

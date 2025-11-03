import { type PageLayoutCommandMenuPage } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPage';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconChartPie,
  IconFilter,
  IconFrame,
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
    default:
      assertUnreachable(page);
  }
};

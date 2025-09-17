import { type PageLayoutCommandMenuPage } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPage';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { assertUnreachable } from 'twenty-shared/utils';
import { IconAppWindow, IconChartPie, IconFrame } from 'twenty-ui/display';

export const getPageLayoutIcon = (page: PageLayoutCommandMenuPage) => {
  switch (page) {
    case CommandMenuPages.PageLayoutWidgetTypeSelect:
      return IconAppWindow;
    case CommandMenuPages.PageLayoutGraphTypeSelect:
      return IconChartPie;
    case CommandMenuPages.PageLayoutIframeConfig:
      return IconFrame;
    default:
      assertUnreachable(page);
  }
};

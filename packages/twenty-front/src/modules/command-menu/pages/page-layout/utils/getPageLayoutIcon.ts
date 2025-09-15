import { type PageLayoutCommandMenuPages } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPages';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { assertUnreachable } from 'twenty-shared/utils';
import { IconAppWindow, IconChartPie, IconFrame } from 'twenty-ui/display';

export const getPageLayoutIcon = (page: PageLayoutCommandMenuPages) => {
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

import { type PageLayoutCommandMenuPages } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPages';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { assertUnreachable } from 'twenty-shared/utils';

export const getPageLayoutPageTitle = (page: PageLayoutCommandMenuPages) => {
  switch (page) {
    case CommandMenuPages.PageLayoutWidgetTypeSelect:
      return 'Add Widget';
    case CommandMenuPages.PageLayoutGraphTypeSelect:
      return 'Select Graph Type';
    case CommandMenuPages.PageLayoutIframeConfig:
      return 'Configure iFrame';
    default:
      assertUnreachable(page);
  }
};

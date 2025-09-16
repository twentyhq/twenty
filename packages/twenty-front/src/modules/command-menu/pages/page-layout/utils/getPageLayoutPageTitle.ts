import { type PageLayoutCommandMenuPages } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPages';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getPageLayoutPageTitle = (page: PageLayoutCommandMenuPages) => {
  switch (page) {
    case CommandMenuPages.PageLayoutWidgetTypeSelect:
      return msg`Add Widget`;
    case CommandMenuPages.PageLayoutGraphTypeSelect:
      return msg`Select Graph Type`;
    case CommandMenuPages.PageLayoutIframeConfig:
      return msg`Configure iFrame`;
    default:
      assertUnreachable(page);
  }
};

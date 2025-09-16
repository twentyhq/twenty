import { type PageLayoutCommandMenuPage } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPages';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getPageLayoutPageTitle = (page: PageLayoutCommandMenuPage) => {
  switch (page) {
    case CommandMenuPages.PageLayoutWidgetTypeSelect:
      return t`Add Widget`;
    case CommandMenuPages.PageLayoutGraphTypeSelect:
      return t`Select Graph Type`;
    case CommandMenuPages.PageLayoutIframeConfig:
      return t`Configure iFrame`;
    default:
      assertUnreachable(page);
  }
};

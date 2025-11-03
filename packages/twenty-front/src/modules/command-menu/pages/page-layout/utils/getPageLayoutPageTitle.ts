import { type PageLayoutCommandMenuPage } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPage';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getPageLayoutPageTitle = (page: PageLayoutCommandMenuPage) => {
  switch (page) {
    case CommandMenuPages.PageLayoutWidgetTypeSelect:
      return t`Add Widget`;
    case CommandMenuPages.PageLayoutGraphTypeSelect:
      return t`Select Graph Type`;
    case CommandMenuPages.PageLayoutIframeSettings:
      return t`iFrame Settings`;
    case CommandMenuPages.PageLayoutGraphFilter:
      return t`Configure filters`;
    case CommandMenuPages.PageLayoutTabSettings:
      return t`Tab Settings`;
    default:
      assertUnreachable(page);
  }
};

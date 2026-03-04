import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getPageLayoutPageTitle = (page: PageLayoutSidePanelPage) => {
  switch (page) {
    case SidePanelPages.PageLayoutWidgetTypeSelect:
      return t`Add Widget`;
    case SidePanelPages.PageLayoutGraphTypeSelect:
      return t`Select Graph Type`;
    case SidePanelPages.PageLayoutIframeSettings:
      return t`iFrame Settings`;
    case SidePanelPages.PageLayoutGraphFilter:
      return t`Configure filters`;
    case SidePanelPages.PageLayoutTabSettings:
      return t`Tab Settings`;
    case SidePanelPages.PageLayoutFieldsSettings:
      return t`Fields Settings`;
    case SidePanelPages.PageLayoutFieldsLayout:
      return t`Layout`;
    default:
      assertUnreachable(page);
  }
};

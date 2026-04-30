import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getPageLayoutPageTitle = (page: PageLayoutSidePanelPage) => {
  switch (page) {
    case SidePanelPages.PageLayoutDashboardWidgetTypeSelect:
      return t`Add Widget`;
    case SidePanelPages.DashboardChartSettings:
      return t`Select Graph Type`;
    case SidePanelPages.DashboardIframeSettings:
      return t`iFrame Settings`;
    case SidePanelPages.PageLayoutTabSettings:
      return t`Tab Settings`;
    case SidePanelPages.RecordPageFieldsSettings:
      return t`Fields Settings`;
    case SidePanelPages.RecordPageFieldSettings:
      return t`Field widget`;
    case SidePanelPages.DashboardRecordTableSettings:
      return t`Record Table Settings`;
    case SidePanelPages.PageLayoutRecordPageWidgetTypeSelect:
      return t`New widget`;
    default:
      assertUnreachable(page);
  }
};

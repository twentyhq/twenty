import { SidePanelPages } from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const getReplaceWidgetSidePanelPage = (
  pageLayoutType: PageLayoutType,
):
  | SidePanelPages.PageLayoutDashboardWidgetTypeSelect
  | SidePanelPages.PageLayoutRecordPageWidgetTypeSelect =>
  pageLayoutType === PageLayoutType.DASHBOARD
    ? SidePanelPages.PageLayoutDashboardWidgetTypeSelect
    : SidePanelPages.PageLayoutRecordPageWidgetTypeSelect;

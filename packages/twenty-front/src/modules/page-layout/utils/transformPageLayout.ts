import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { validatePageLayoutWidget } from '@/page-layout/utils/validatePageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayout as PageLayoutGenerated } from '~/generated/graphql';

export const transformPageLayout = (
  pageLayout: PageLayoutGenerated,
): PageLayout => {
  return {
    ...pageLayout,
    tabs: (pageLayout.tabs ?? []).map(
      (tab): PageLayoutTab => ({
        ...tab,
        widgets: (tab.widgets ?? [])
          .map((widget) => validatePageLayoutWidget(widget))
          .filter(isDefined),
      }),
    ),
  };
};

import { isDefined } from 'twenty-shared/utils';

import { type PageLayout } from '@/page-layout/types/PageLayout';

export const isPageLayoutEmpty = (pageLayout: PageLayout): boolean => {
  const [firstTab, ...otherTabs] = pageLayout.tabs;

  return (
    isDefined(firstTab) &&
    otherTabs.length === 0 &&
    firstTab.widgets.length === 0
  );
};

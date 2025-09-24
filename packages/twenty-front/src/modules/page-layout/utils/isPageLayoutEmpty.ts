import { type PageLayout } from '~/modules/page-layout/types/pageLayoutTypes';

export const isPageLayoutEmpty = (pageLayout: PageLayout): boolean => {
  return (
    pageLayout.tabs.length === 1 && pageLayout.tabs[0].widgets.length === 0
  );
};

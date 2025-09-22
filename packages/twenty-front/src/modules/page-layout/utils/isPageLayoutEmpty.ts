import { type PageLayoutWithData } from '~/modules/page-layout/types/pageLayoutTypes';

export const isPageLayoutEmpty = (pageLayout: PageLayoutWithData): boolean => {
  return (
    pageLayout.tabs.length === 1 && pageLayout.tabs[0].widgets.length === 0
  );
};

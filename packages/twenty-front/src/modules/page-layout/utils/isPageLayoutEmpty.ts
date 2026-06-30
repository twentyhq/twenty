import { type PageLayout } from '@/page-layout/types/PageLayout';

export const isPageLayoutEmpty = (pageLayout: PageLayout): boolean => {
  return (
    pageLayout.tabs.length === 1 && pageLayout.tabs[0].widgets.length === 0
  );
};

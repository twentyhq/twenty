import { type PageLayout } from '~/generated/graphql';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

export const normalizePageLayoutData = (
  pageLayout: PageLayout,
): PageLayoutWithData => {
  return {
    ...pageLayout,
    tabs: (pageLayout.tabs || []).map((tab) => ({
      ...tab,
      widgets: (tab.widgets || []).map((widget) => ({
        ...widget,
        data: undefined,
      })),
    })),
  };
};

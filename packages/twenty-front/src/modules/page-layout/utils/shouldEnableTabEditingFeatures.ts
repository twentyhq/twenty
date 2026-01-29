import { PageLayoutType } from '~/generated/graphql';

export const shouldEnableTabEditingFeatures = (
  pageLayoutType: PageLayoutType | null,
): boolean => {
  // Tab editing features (adding tabs, opening settings on click)
  // should only be enabled for dashboards, not for record pages
  return pageLayoutType === PageLayoutType.DASHBOARD;
};

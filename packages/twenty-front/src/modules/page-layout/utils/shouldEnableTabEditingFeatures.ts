import { PageLayoutType } from '~/generated/graphql';

export const shouldEnableTabEditingFeatures = (
  pageLayoutType: PageLayoutType,
): boolean => {
  return pageLayoutType === PageLayoutType.DASHBOARD;
};

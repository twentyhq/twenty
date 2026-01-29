import { PageLayoutType } from '~/generated/graphql';

export const shouldEnableTabEditingFeatures = (
  pageLayoutType: PageLayoutType | null,
): boolean => {
  return pageLayoutType === PageLayoutType.DASHBOARD;
};

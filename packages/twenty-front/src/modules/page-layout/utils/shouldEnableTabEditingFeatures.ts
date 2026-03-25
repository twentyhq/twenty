import { PageLayoutType } from '~/generated-metadata/graphql';

export const shouldEnableTabEditingFeatures = (
  pageLayoutType: PageLayoutType,
  isRecordPageGlobalEditionEnabled?: boolean,
): boolean => {
  if (pageLayoutType === PageLayoutType.DASHBOARD) {
    return true;
  }

  if (
    pageLayoutType === PageLayoutType.RECORD_PAGE &&
    isRecordPageGlobalEditionEnabled
  ) {
    return true;
  }

  return false;
};

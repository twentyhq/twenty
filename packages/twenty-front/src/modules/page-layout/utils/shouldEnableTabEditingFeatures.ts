import { PageLayoutType } from '~/generated-metadata/graphql';

export const shouldEnableTabEditingFeatures = (
  pageLayoutType: PageLayoutType,
  isRecordPageGlobalEditionEnabled?: boolean,
): boolean => {
  if (
    pageLayoutType === PageLayoutType.DASHBOARD ||
    pageLayoutType === PageLayoutType.STANDALONE_PAGE
  ) {
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

import { PageLayoutType } from '~/generated-metadata/graphql';

export const shouldEnableTabEditingFeatures = (
  pageLayoutType: PageLayoutType,
): boolean => {
  return (
    pageLayoutType === PageLayoutType.DASHBOARD ||
    pageLayoutType === PageLayoutType.STANDALONE_PAGE ||
    pageLayoutType === PageLayoutType.RECORD_PAGE
  );
};

import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

export const getDefaultTabLayoutMode = (
  pageLayoutType: PageLayoutType,
): PageLayoutTabLayoutMode => {
  if (pageLayoutType === PageLayoutType.RECORD_PAGE) {
    return PageLayoutTabLayoutMode.VERTICAL_LIST;
  }

  return PageLayoutTabLayoutMode.GRID;
};

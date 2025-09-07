import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PageLayoutTabExceptionCode {
  PAGE_LAYOUT_TAB_NOT_FOUND = 'PAGE_LAYOUT_TAB_NOT_FOUND',
  INVALID_PAGE_LAYOUT_TAB_DATA = 'INVALID_PAGE_LAYOUT_TAB_DATA',
}

export enum PageLayoutTabExceptionMessageKey {
  PAGE_LAYOUT_TAB_NOT_FOUND = 'PAGE_LAYOUT_TAB_NOT_FOUND',
  TITLE_REQUIRED = 'TITLE_REQUIRED',
  PAGE_LAYOUT_ID_REQUIRED = 'PAGE_LAYOUT_ID_REQUIRED',
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  PAGE_LAYOUT_TAB_NOT_DELETED = 'PAGE_LAYOUT_TAB_NOT_DELETED',
}

export class PageLayoutTabException extends CustomException<PageLayoutTabExceptionCode> {}

export const generatePageLayoutTabExceptionMessage = (
  key: PageLayoutTabExceptionMessageKey,
  value?: string,
): string => {
  switch (key) {
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND:
      return `Page layout tab with ID "${value}" not found`;
    case PageLayoutTabExceptionMessageKey.TITLE_REQUIRED:
      return 'Page layout tab title is required';
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED:
      return 'Page layout ID is required';
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND:
      return 'Page layout not found';
    case PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_DELETED:
      return 'Page layout tab is not deleted and cannot be restored';
    default:
      assertUnreachable(key);
  }
};

import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PageLayoutExceptionCode {
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  INVALID_PAGE_LAYOUT_DATA = 'INVALID_PAGE_LAYOUT_DATA',
}

export enum PageLayoutExceptionMessageKey {
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  NAME_REQUIRED = 'NAME_REQUIRED',
}

export class PageLayoutException extends CustomException<PageLayoutExceptionCode> {}

export const generatePageLayoutExceptionMessage = (
  key: PageLayoutExceptionMessageKey,
  value?: string,
): string => {
  switch (key) {
    case PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND:
      return `Page layout with ID "${value}" not found`;
    case PageLayoutExceptionMessageKey.NAME_REQUIRED:
      return 'Page layout name is required';
    default:
      assertUnreachable(key);
  }
};

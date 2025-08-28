import { CustomException } from 'src/utils/custom-exception';

export enum PageLayoutExceptionCode {
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  INVALID_PAGE_LAYOUT_DATA = 'INVALID_PAGE_LAYOUT_DATA',
}

export enum PageLayoutExceptionMessageKey {
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  NAME_REQUIRED = 'NAME_REQUIRED',
}

export class PageLayoutException extends CustomException {
  code: PageLayoutExceptionCode;
  constructor(
    message: string,
    code: PageLayoutExceptionCode,
    metadata?: Record<string, unknown>,
  ) {
    super(message, code, metadata);
  }
}

export const generatePageLayoutExceptionMessage = (
  key: PageLayoutExceptionMessageKey,
  value?: string,
): string => {
  switch (key) {
    case PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND:
      return `Page layout with ID "${value}" not found`;
    case PageLayoutExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'Workspace ID is required';
    case PageLayoutExceptionMessageKey.NAME_REQUIRED:
      return 'Page layout name is required';
  }
};

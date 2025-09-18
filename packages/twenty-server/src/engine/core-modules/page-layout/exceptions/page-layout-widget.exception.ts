import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PageLayoutWidgetExceptionCode {
  PAGE_LAYOUT_WIDGET_NOT_FOUND = 'PAGE_LAYOUT_WIDGET_NOT_FOUND',
  INVALID_PAGE_LAYOUT_WIDGET_DATA = 'INVALID_PAGE_LAYOUT_WIDGET_DATA',
  FORBIDDEN_OBJECT_METADATA_ACCESS = 'FORBIDDEN_OBJECT_METADATA_ACCESS',
}

export enum PageLayoutWidgetExceptionMessageKey {
  PAGE_LAYOUT_WIDGET_NOT_FOUND = 'PAGE_LAYOUT_WIDGET_NOT_FOUND',
  TITLE_REQUIRED = 'TITLE_REQUIRED',
  PAGE_LAYOUT_TAB_ID_REQUIRED = 'PAGE_LAYOUT_TAB_ID_REQUIRED',
  PAGE_LAYOUT_TAB_NOT_FOUND = 'PAGE_LAYOUT_TAB_NOT_FOUND',
  PAGE_LAYOUT_WIDGET_NOT_DELETED = 'PAGE_LAYOUT_WIDGET_NOT_DELETED',
  GRID_POSITION_REQUIRED = 'GRID_POSITION_REQUIRED',
  OBJECT_METADATA_ACCESS_FORBIDDEN = 'OBJECT_METADATA_ACCESS_FORBIDDEN',
  CONFIGURATION_UPDATE_FORBIDDEN = 'CONFIGURATION_UPDATE_FORBIDDEN',
}

export class PageLayoutWidgetException extends CustomException<PageLayoutWidgetExceptionCode> {}

export const generatePageLayoutWidgetExceptionMessage = (
  key: PageLayoutWidgetExceptionMessageKey,
  value?: string,
): string => {
  switch (key) {
    case PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND:
      return `Page layout widget with ID "${value}" not found`;
    case PageLayoutWidgetExceptionMessageKey.TITLE_REQUIRED:
      return 'Page layout widget title is required';
    case PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_ID_REQUIRED:
      return 'Page layout tab ID is required';
    case PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND:
      return 'Page layout tab not found';
    case PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_DELETED:
      return 'Page layout widget is not deleted and cannot be restored';
    case PageLayoutWidgetExceptionMessageKey.GRID_POSITION_REQUIRED:
      return 'Grid position is required';
    case PageLayoutWidgetExceptionMessageKey.OBJECT_METADATA_ACCESS_FORBIDDEN:
      return `Cannot create or update widget for object "${value}" without permission`;
    case PageLayoutWidgetExceptionMessageKey.CONFIGURATION_UPDATE_FORBIDDEN:
      return 'Cannot update widget configuration without object permission';
    default:
      assertUnreachable(key);
  }
};

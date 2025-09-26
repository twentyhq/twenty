import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PageLayoutWidgetExceptionCode {
  PAGE_LAYOUT_WIDGET_NOT_FOUND = 'PAGE_LAYOUT_WIDGET_NOT_FOUND',
  INVALID_PAGE_LAYOUT_WIDGET_DATA = 'INVALID_PAGE_LAYOUT_WIDGET_DATA',
}

export enum PageLayoutWidgetExceptionMessageKey {
  PAGE_LAYOUT_WIDGET_NOT_FOUND = 'PAGE_LAYOUT_WIDGET_NOT_FOUND',
  TITLE_REQUIRED = 'TITLE_REQUIRED',
  PAGE_LAYOUT_TAB_ID_REQUIRED = 'PAGE_LAYOUT_TAB_ID_REQUIRED',
  PAGE_LAYOUT_TAB_NOT_FOUND = 'PAGE_LAYOUT_TAB_NOT_FOUND',
  PAGE_LAYOUT_WIDGET_NOT_DELETED = 'PAGE_LAYOUT_WIDGET_NOT_DELETED',
  GRID_POSITION_REQUIRED = 'GRID_POSITION_REQUIRED',
  INVALID_WIDGET_CONFIGURATION = 'INVALID_WIDGET_CONFIGURATION',
}

export class PageLayoutWidgetException extends CustomException<PageLayoutWidgetExceptionCode> {}

export const generatePageLayoutWidgetExceptionMessage = (
  key: PageLayoutWidgetExceptionMessageKey,
  widgetTitle?: string,
  widgetType?: string,
  detailedError?: string,
): string => {
  switch (key) {
    case PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND:
      return `Page layout widget with ID "${widgetTitle}" not found`;
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
    case PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION:
      if (widgetTitle && widgetType && detailedError) {
        return `Invalid configuration for widget "${widgetTitle}" of type ${widgetType}: ${detailedError}`;
      }
      if (widgetTitle && widgetType) {
        return `Invalid configuration for widget "${widgetTitle}" of type ${widgetType}`;
      }
      if (widgetType) {
        return `Invalid configuration for widget type ${widgetType}`;
      }

      return 'Invalid widget configuration';
    default:
      assertUnreachable(key);
  }
};

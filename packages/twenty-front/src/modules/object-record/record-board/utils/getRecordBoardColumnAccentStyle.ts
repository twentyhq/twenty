import { type CSSProperties } from 'react';
import { type ThemeColor, themeCssVariables } from 'twenty-ui/theme';

import { RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES } from '@/object-record/record-board/constants/RecordBoardColumnAccentCssVariableNames';

export const getRecordBoardColumnAccentStyle = (
  color: ThemeColor | 'transparent',
): CSSProperties => {
  const themeColor = color === 'transparent' ? 'gray' : color;

  return {
    [RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES.accent]:
      themeCssVariables.color[themeColor],
    [RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES.headerSurface]:
      themeCssVariables.tag.background[themeColor],
    [RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES.surface]:
      themeCssVariables.color[`${themeColor}2`],
  } as CSSProperties;
};

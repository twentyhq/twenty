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
  } as CSSProperties;
};

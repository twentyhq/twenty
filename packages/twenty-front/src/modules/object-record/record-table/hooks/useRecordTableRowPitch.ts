import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

// Rows render at calc(32px * --t-scale) plus a 1px border that does not
// scale, so every piece of virtualization math has to use the same pitch or
// row positions drift from what the CSS lays out.
export const useRecordTableRowPitch = () => {
  const { theme } = useContext(ThemeContext);

  const scaledRowHeight = RECORD_TABLE_ROW_HEIGHT * theme.scale;
  const rowPitch = scaledRowHeight + 1;

  return { scaledRowHeight, rowPitch };
};

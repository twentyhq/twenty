import { type Layouts } from 'react-grid-layout';
import { GRID_BUFFER_ROWS } from '@/page-layout/constants/GridBufferRows';
import { GRID_MIN_ROWS } from '@/page-layout/constants/GridMinRows';

export const calculateTotalGridRows = (
  layouts: Layouts,
  minRows = GRID_MIN_ROWS,
  bufferRows = GRID_BUFFER_ROWS,
): number => {
  const allLayouts = [...(layouts.desktop || []), ...(layouts.mobile || [])];

  const contentRows =
    allLayouts.length === 0
      ? 0
      : Math.max(...allLayouts.map((item) => item.y + item.h));

  return Math.max(minRows, contentRows + bufferRows);
};

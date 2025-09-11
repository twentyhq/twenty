import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { sumByProperty } from 'twenty-shared/utils';

// TODO: use this everywhere and extract in files
export const RECORD_TABLE_DRAG_DROP_COLUMN_WIDTH = 16;
export const RECORD_TABLE_CHECKBOX_COLUMN_WIDTH = 32;
export const RECORD_TABLE_PLUS_BUTTON_COLUMN_WIDTH = 32;

export const useRecordTableLastColumnWidthToFill = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableWidth = useRecoilComponentValue(
    recordTableWidthComponentState,
  );

  const totalColumnsWidth = visibleRecordFields.reduce(
    sumByProperty('size'),
    0,
  );

  const widthOfBorders = visibleRecordFields.length;

  const fixedColumnsWidth =
    RECORD_TABLE_DRAG_DROP_COLUMN_WIDTH +
    RECORD_TABLE_CHECKBOX_COLUMN_WIDTH +
    RECORD_TABLE_PLUS_BUTTON_COLUMN_WIDTH +
    widthOfBorders;

  const remainingWidthToFill = Math.max(
    0,
    recordTableWidth - fixedColumnsWidth - totalColumnsWidth,
  );

  const width = remainingWidthToFill > 0 ? remainingWidthToFill : 0;

  return {
    lastColumnWidth: width,
  };
};

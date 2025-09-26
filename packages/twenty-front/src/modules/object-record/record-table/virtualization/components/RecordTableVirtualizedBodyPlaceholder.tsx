import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { computeVisibleRecordFieldsWidthOnTable } from '@/object-record/record-table/utils/computeVisibleRecordFieldsWidthOnTable';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordTableVirtualizedBodyPlaceholder = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isMobile = useIsMobile();

  const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable({
    isMobile,
    visibleRecordFields,
  });

  const totalNumberOfRecordsToVirtualize = useRecoilComponentValue(
    totalNumberOfRecordsToVirtualizeComponentState,
  );

  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const totalWidth =
    visibleRecordFieldsWidth +
    RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
    RECORD_TABLE_COLUMN_CHECKBOX_WIDTH +
    RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH +
    lastColumnWidth +
    visibleRecordFields.length;

  const totalHeight = isDefined(totalNumberOfRecordsToVirtualize)
    ? totalNumberOfRecordsToVirtualize * (RECORD_TABLE_ROW_HEIGHT + 1)
    : '0';

  return (
    <div
      style={{
        height: totalHeight,
        width: totalWidth,
      }}
    ></div>
  );
};

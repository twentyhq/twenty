import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { useRecordTableFirstColumnWidthOverride } from '@/object-record/record-table/hooks/useRecordTableFirstColumnWidthOverride';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { resizedRecordFieldKeyComponentState } from '@/object-record/record-table/states/resizedRecordFieldKeyComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { RECORD_TABLE_COLUMN_VIRTUALIZATION_OVERSCAN_WIDTH } from '@/object-record/record-table/virtualization/constants/RecordTableColumnVirtualizationOverscanWidth';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { computeRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnRange';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableColumnVirtualizationEffect = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableWidth = useAtomComponentStateValue(
    recordTableWidthComponentState,
  );

  const resizedRecordFieldKey = useAtomComponentStateValue(
    resizedRecordFieldKeyComponentState,
  );

  const resizeFieldOffset = useAtomComponentStateValue(
    resizeFieldOffsetComponentState,
  );

  const firstColumnWidthOverride = useRecordTableFirstColumnWidthOverride();

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  const renderedColumnRangeCallbackState = useAtomComponentStateCallbackState(
    recordTableRenderedColumnRangeComponentState,
  );

  const scrollWrapperScrollLeftCallbackState =
    useAtomComponentStateCallbackState(scrollWrapperScrollLeftComponentState);

  const store = useStore();

  useEffect(() => {
    if (recordTableWidth === 0) {
      return;
    }

    const displayedRecordFields = visibleRecordFields.map(
      (recordField, index) => {
        if (index === 0 && isDefined(firstColumnWidthOverride)) {
          return { size: firstColumnWidthOverride };
        }

        return getRecordFieldKey(recordField) === resizedRecordFieldKey
          ? { size: recordField.size + resizeFieldOffset }
          : recordField;
      },
    );

    const leftColumnsWidth =
      (isRecordTableDragColumnHidden
        ? 0
        : RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH) +
      (isRecordTableCheckboxColumnHidden
        ? 0
        : RECORD_TABLE_COLUMN_CHECKBOX_WIDTH);

    const updateRenderedColumnRange = () => {
      const visibleStartPosition =
        Math.abs(store.get(scrollWrapperScrollLeftCallbackState)) -
        leftColumnsWidth;

      const computeColumnRangeWithOverscan = (overscanWidth: number) =>
        computeRecordTableColumnRange({
          visibleRecordFields: displayedRecordFields,
          visibleStartPosition: visibleStartPosition - overscanWidth,
          visibleEndPosition:
            visibleStartPosition + recordTableWidth + overscanWidth,
        });

      const currentColumnRange = store.get(renderedColumnRangeCallbackState);

      const requiredColumnRange = computeColumnRangeWithOverscan(
        RECORD_TABLE_COLUMN_VIRTUALIZATION_OVERSCAN_WIDTH / 2,
      );

      if (
        isDefined(currentColumnRange) &&
        requiredColumnRange.startColumnIndex >=
          currentColumnRange.startColumnIndex &&
        requiredColumnRange.endColumnIndex <= currentColumnRange.endColumnIndex
      ) {
        return;
      }

      store.set(
        renderedColumnRangeCallbackState,
        computeColumnRangeWithOverscan(
          RECORD_TABLE_COLUMN_VIRTUALIZATION_OVERSCAN_WIDTH,
        ),
      );
    };

    updateRenderedColumnRange();

    return store.sub(
      scrollWrapperScrollLeftCallbackState,
      updateRenderedColumnRange,
    );
  }, [
    store,
    visibleRecordFields,
    recordTableWidth,
    resizedRecordFieldKey,
    resizeFieldOffset,
    firstColumnWidthOverride,
    isRecordTableDragColumnHidden,
    isRecordTableCheckboxColumnHidden,
    renderedColumnRangeCallbackState,
    scrollWrapperScrollLeftCallbackState,
  ]);

  return null;
};

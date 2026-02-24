import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';

import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnMinWidth';
import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';

import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useSaveRecordFields } from '@/views/hooks/useSaveRecordFields';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import {
  findById,
  findByProperty,
  throwIfNotDefined,
} from 'twenty-shared/utils';

export const useResizeTableHeader = () => {
  const { recordTableId, visibleRecordFields } = useRecordTableContextOrThrow();

  const resizeFieldOffsetAtom = useRecoilComponentStateCallbackStateV2(
    resizeFieldOffsetComponentState,
    recordTableId,
  );

  const setResizeFieldOffset = useSetRecoilComponentStateV2(
    resizeFieldOffsetComponentState,
    recordTableId,
  );

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);

  const [resizedFieldMetadataItemId, setResizedFieldMetadataItemId] =
    useRecoilComponentStateV2(resizedFieldMetadataIdComponentState);

  const recordField = visibleRecordFields.find(
    findByProperty('fieldMetadataItemId', resizedFieldMetadataItemId),
  );

  const { resetTableRowSelection } = useResetTableRowSelection();

  const { saveRecordFields } = useSaveRecordFields();

  const { updateRecordField } = useUpdateRecordField();

  const recordTableWidth = useRecoilComponentValueV2(
    recordTableWidthComponentState,
    recordTableId,
  );

  const shouldCompactRecordTableFirstColumn = useRecoilComponentValueV2(
    shouldCompactRecordTableFirstColumnComponentState,
    recordTableId,
  );

  const handleResizeHandlerStart = useCallback<PointerEventListener>(
    ({ x }) => {
      resetTableRowSelection();
      setInitialPointerPositionX(x);
    },
    [resetTableRowSelection],
  );

  const handleResizeHandlerMove = useCallback<PointerEventListener>(
    ({ x }) => {
      if (!initialPointerPositionX) return;

      throwIfNotDefined(recordField, 'recordField');

      const newResizeOffset = x - initialPointerPositionX;

      const newRecordFieldSizeWithOffset = recordField.size + newResizeOffset;

      if (newRecordFieldSizeWithOffset < RECORD_TABLE_COLUMN_MIN_WIDTH) {
        return;
      }

      const newWidth = recordField.size + newResizeOffset;

      const recordFieldIndex = visibleRecordFields.findIndex(
        findById(recordField.id),
      );

      updateRecordTableCSSVariable(
        getRecordTableColumnFieldWidthCSSVariableName(recordFieldIndex),
        `${newWidth}px`,
      );

      const { lastColumnWidth } = computeLastRecordTableColumnWidth({
        recordFields: visibleRecordFields,
        shouldCompactFirstColumn: shouldCompactRecordTableFirstColumn,
        tableWidth: recordTableWidth,
      });

      const newLastColumnWidth = lastColumnWidth - newResizeOffset;

      updateRecordTableCSSVariable(
        RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
        `${newLastColumnWidth}px`,
      );

      const newGroupSectionLastColumnWidth = Math.max(
        lastColumnWidth,
        lastColumnWidth + newResizeOffset,
      );

      updateRecordTableCSSVariable(
        RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
        `${newGroupSectionLastColumnWidth}px`,
      );

      setResizeFieldOffset(x - initialPointerPositionX);
    },
    [
      initialPointerPositionX,
      recordField,
      visibleRecordFields,
      shouldCompactRecordTableFirstColumn,
      recordTableWidth,
      setResizeFieldOffset,
    ],
  );

  const { setDragSelectionStartEnabled } = useDragSelect();

  const store = useStore();

  const handleResizeHandlerEnd = useCallback(async () => {
    throwIfNotDefined(recordField, 'recordField');

    if (!resizedFieldMetadataItemId) return;

    const resizeFieldOffset = store.get(resizeFieldOffsetAtom);

    const nextWidth = Math.round(
      Math.max(
        recordField.size + resizeFieldOffset,
        RECORD_TABLE_COLUMN_MIN_WIDTH,
      ),
    );

    store.set(resizeFieldOffsetAtom, 0);
    setInitialPointerPositionX(null);
    setResizedFieldMetadataItemId(null);

    if (nextWidth !== recordField.size) {
      const updatedRecordField = updateRecordField(resizedFieldMetadataItemId, {
        size: nextWidth,
      });

      saveRecordFields([updatedRecordField]);
    }

    setDragSelectionStartEnabled(true);
  }, [
    saveRecordFields,
    resizedFieldMetadataItemId,
    resizeFieldOffsetAtom,
    store,
    setResizedFieldMetadataItemId,
    updateRecordField,
    setDragSelectionStartEnabled,
    recordField,
  ]);

  useTrackPointer({
    shouldTrackPointer: resizedFieldMetadataItemId !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });
};

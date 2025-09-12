import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';

import { COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/ColumnMinWidth';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';

import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveRecordFields } from '@/views/hooks/useSaveRecordFields';
import { useCallback, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import {
  findById,
  findByProperty,
  throwIfNotDefined,
} from 'twenty-shared/utils';

export const useResizeTableHeader = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const resizeFieldOffsetCallbackState = useRecoilComponentCallbackState(
    resizeFieldOffsetComponentState,
  );

  const setResizeFieldOffset = useSetRecoilComponentState(
    resizeFieldOffsetComponentState,
  );

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);

  const [resizedFieldMetadataItemId, setResizedFieldMetadataItemId] =
    useRecoilComponentState(resizedFieldMetadataIdComponentState);

  const recordField = visibleRecordFields.find(
    findByProperty('fieldMetadataItemId', resizedFieldMetadataItemId),
  );

  const { resetTableRowSelection } = useResetTableRowSelection();

  const { saveRecordFields } = useSaveRecordFields();

  const { updateRecordField } = useUpdateRecordField();

  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

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

      if (newRecordFieldSizeWithOffset < COLUMN_MIN_WIDTH) {
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

      const newLastColumnWidth = lastColumnWidth - newResizeOffset;

      updateRecordTableCSSVariable(
        RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME,
        `${newLastColumnWidth}px`,
      );

      setResizeFieldOffset(x - initialPointerPositionX);
    },
    [
      setResizeFieldOffset,
      initialPointerPositionX,
      recordField,
      lastColumnWidth,
      visibleRecordFields,
    ],
  );

  const { setDragSelectionStartEnabled } = useDragSelect();

  const handleResizeHandlerEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        throwIfNotDefined(recordField, 'recordField');

        if (!resizedFieldMetadataItemId) return;

        const resizeFieldOffset = getSnapshotValue(
          snapshot,
          resizeFieldOffsetCallbackState,
        );

        const nextWidth = Math.round(
          Math.max(recordField.size + resizeFieldOffset, COLUMN_MIN_WIDTH),
        );

        set(resizeFieldOffsetCallbackState, 0);
        setInitialPointerPositionX(null);
        setResizedFieldMetadataItemId(null);

        if (nextWidth !== recordField.size) {
          const updatedRecordField = updateRecordField(
            resizedFieldMetadataItemId,
            {
              size: nextWidth,
            },
          );

          saveRecordFields([updatedRecordField]);
        }

        setDragSelectionStartEnabled(true);
      },
    [
      saveRecordFields,
      resizedFieldMetadataItemId,
      resizeFieldOffsetCallbackState,
      setResizedFieldMetadataItemId,
      updateRecordField,
      setDragSelectionStartEnabled,
      recordField,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldMetadataItemId !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });
};

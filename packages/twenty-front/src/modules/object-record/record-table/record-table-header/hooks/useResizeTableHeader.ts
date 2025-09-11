import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/ColumnMinWidth';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';

import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
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
import { findByProperty, throwIfNotDefined } from 'twenty-shared/utils';

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

      setResizeFieldOffset(x - initialPointerPositionX);
    },
    [setResizeFieldOffset, initialPointerPositionX, recordField],
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

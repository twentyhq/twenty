import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
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

export const COLUMN_RESIZE_MIN_WIDTH = 48;

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

  const { saveRecordFields } = useSaveRecordFields();

  const { updateRecordField } = useUpdateRecordField();

  const handleResizeHandlerStart = useCallback<PointerEventListener>(
    ({ x }) => {
      setInitialPointerPositionX(x);
    },
    [],
  );

  const handleResizeHandlerMove = useCallback<PointerEventListener>(
    ({ x }) => {
      if (!initialPointerPositionX) return;

      setResizeFieldOffset(x - initialPointerPositionX);
    },
    [setResizeFieldOffset, initialPointerPositionX],
  );

  const handleResizeHandlerEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const recordField = visibleRecordFields.find(
          findByProperty('fieldMetadataItemId', resizedFieldMetadataItemId),
        );

        throwIfNotDefined(recordField, 'recordField');

        if (!resizedFieldMetadataItemId) return;

        const resizeFieldOffset = getSnapshotValue(
          snapshot,
          resizeFieldOffsetCallbackState,
        );

        const nextWidth = Math.round(
          Math.max(
            recordField.size + resizeFieldOffset,
            COLUMN_RESIZE_MIN_WIDTH,
          ),
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
      },
    [
      saveRecordFields,
      resizedFieldMetadataItemId,
      resizeFieldOffsetCallbackState,
      setResizedFieldMetadataItemId,
      updateRecordField,
      visibleRecordFields,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldMetadataItemId !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });
};

import { type DragDropProvider } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ComponentProps, useCallback, useState } from 'react';
import { filterOutByProperty, isDefined } from 'twenty-shared/utils';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { resolveRecordTableHeaderDrop } from '@/object-record/record-table/record-table-header/dnd/utils/resolveRecordTableHeaderDrop';
import { useReorderColumns } from '@/object-record/record-table/record-table-header/hooks/useReorderColumns';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { type RecordTableHeaderDndData } from '@/object-record/record-table/record-table-header/dnd/types/RecordTableHeaderDndData';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordTableHeaderDndData>
    >['onDragStart']
  >
>[0];
type DragMovePayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordTableHeaderDndData>
    >['onDragMove']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordTableHeaderDndData>
    >['onDragEnd']
  >
>[0];

export type RecordTableHeaderDndKitContextValues = {
  isDragging: boolean;
  activeDropTargetIndex: number | null;
  activeDraggedSourceIndex: number | null;
};

export const useRecordTableHeaderDndKit = (): {
  contextValues: RecordTableHeaderDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragMove: (event: DragMovePayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const store = useStore();

  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();
  const { reorderColumns } = useReorderColumns();
  const { setDragSelectionStartEnabled } = useDragSelect();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const isRecordTableHeaderDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderDropProcessingComponentState,
    );
  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );
  const isRecordTableCheckboxColumnHidden = useAtomComponentStateValue(
    isRecordTableCheckboxColumnHiddenComponentState,
  );

  const [isDragging, setIsDragging] = useState(false);
  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);
  const [activeDraggedSourceIndex, setActiveDraggedSourceIndex] = useState<
    number | null
  >(null);

  const recordFieldsWithoutLabelIdentifier = visibleRecordFields.filter(
    filterOutByProperty(
      'fieldMetadataItemId',
      labelIdentifierFieldMetadataItem?.id,
    ),
  );

  const labelIdentifierRecordField = visibleRecordFields.find(
    (recordField) =>
      recordField.fieldMetadataItemId === labelIdentifierFieldMetadataItem?.id,
  );

  const nonSortableColumnsWidth =
    (isRecordTableDragColumnHidden
      ? 0
      : RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH) +
    (isRecordTableCheckboxColumnHidden
      ? 0
      : RECORD_TABLE_COLUMN_CHECKBOX_WIDTH) +
    (labelIdentifierRecordField?.size ?? 0);

  const resolveDropFromPointerX = useCallback(
    ({ pointerX, sourceIndex }: { pointerX: number; sourceIndex: number }) => {
      const { scrollWrapperElement } = getScrollWrapperElement();
      if (!isDefined(scrollWrapperElement)) return null;

      return resolveRecordTableHeaderDrop({
        pointerX,
        sourceIndex,
        scrollWrapperElement,
        nonSortableColumnsWidth,
        recordFields: recordFieldsWithoutLabelIdentifier,
      });
    },
    [
      getScrollWrapperElement,
      nonSortableColumnsWidth,
      recordFieldsWithoutLabelIdentifier,
    ],
  );

  const handleDragStart = (event: DragStartPayload) => {
    const { operation } = event;
    const sourceIndex = operation.source?.data.index;

    setIsDragging(true);
    setActiveDraggedSourceIndex(sourceIndex ?? null);

    store.set(isRecordTableHeaderDropProcessingCallbackState, true);

    setActiveDropTargetIndex(null);
  };

  const handleDragMove = useCallback(
    (event: DragMovePayload) => {
      const { operation } = event;
      const sourceIndex = operation.source?.data.index;

      if (!isDefined(sourceIndex)) {
        setActiveDropTargetIndex(null);
        return;
      }

      const resolvedDrop = resolveDropFromPointerX({
        pointerX: operation.position.current.x,
        sourceIndex,
      });

      setActiveDropTargetIndex((currentActiveDropTargetIndex) => {
        const nextActiveDropTargetIndex = resolvedDrop?.dropTargetIndex ?? null;

        return currentActiveDropTargetIndex === nextActiveDropTargetIndex
          ? currentActiveDropTargetIndex
          : nextActiveDropTargetIndex;
      });
    },
    [resolveDropFromPointerX, setActiveDropTargetIndex],
  );

  const handleDragEnd = (event: DragEndPayload) => {
    const { operation } = event;
    const source = operation.source;

    setIsDragging(false);
    setActiveDropTargetIndex(null);
    setActiveDraggedSourceIndex(null);
    setDragSelectionStartEnabled(true);
    store.set(isRecordTableHeaderDropProcessingCallbackState, false);

    if (event.canceled) return;
    if (!isDefined(source)) return;

    const sourceIndex = source.data.index;
    const resolvedDrop = resolveDropFromPointerX({
      pointerX: operation.position.current.x,
      sourceIndex,
    });

    if (!isDefined(resolvedDrop)) return;

    reorderColumns({
      sourceIndex: resolvedDrop.sourceIndex,
      destinationIndex: resolvedDrop.destinationIndex,
    });
  };

  const contextValues: RecordTableHeaderDndKitContextValues = {
    isDragging,
    activeDropTargetIndex,
    activeDraggedSourceIndex,
  };

  return {
    contextValues,
    handlers: {
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
    },
  };
};

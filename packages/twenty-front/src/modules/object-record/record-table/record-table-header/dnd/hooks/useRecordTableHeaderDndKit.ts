import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { resolveDropFromPointerX } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointerX';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';

type DragStartPayload = DragDropProviderDragStartEvent<DragDropItemData>;
type DragMovePayload = DragDropProviderDragMoveEvent<DragDropItemData>;
type DragEndPayload = DragDropProviderDragEndEvent<DragDropItemData>;

export type RecordTableHeaderDndKitContextValues = {
  activeDropTargetIndex: number | null;
};

export const useRecordTableHeaderDndKit = (): {
  contextValues: RecordTableHeaderDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragMove: (event: DragMovePayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const { recordTableId, visibleRecordFields } = useRecordTableContextOrThrow();
  const { reorderVisibleRecordFields } =
    useReorderVisibleRecordFields(recordTableId);
  const { saveViewFields } = useSaveCurrentViewFields();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);

  const totalSize = visibleRecordFields.reduce(
    (accumulatedSize, recordField) => accumulatedSize + recordField.size,
    0,
  );

  const lastIndex = visibleRecordFields.length - 1;

  const handleDragStart = (_event: DragStartPayload) => {
    setActiveDropTargetIndex(null);
  };

  const handleDragMove = (event: DragMovePayload) => {
    const { target, position } = event.operation;

    const dropTargetIndex = resolveDropFromPointerX({
      target,
      pointerX: position.current.x,
      totalSize,
      lastIndex,
    });

    setActiveDropTargetIndex((currentActiveDropTargetIndex) =>
      currentActiveDropTargetIndex === dropTargetIndex
        ? currentActiveDropTargetIndex
        : dropTargetIndex,
    );
  };

  const handleDragEnd = (event: DragEndPayload) => {
    const { source, target, position } = event.operation;

    setActiveDropTargetIndex(null);
    setDragSelectionStartEnabled(true);

    if (event.canceled || !isDefined(source)) {
      return;
    }

    const sourceIndex = source.data.index;

    const dropTargetIndex = resolveDropFromPointerX({
      target,
      pointerX: position.current.x,
      totalSize,
      lastIndex,
    });
    if (!isDefined(dropTargetIndex)) return;

    const destinationIndex =
      dropTargetIndex < sourceIndex ? dropTargetIndex + 1 : dropTargetIndex;

    // Sortable indices exclude the pinned label-identifier column at visibleRecordFields[0],
    // so shift by one to address the full visible field list.
    const updatedRecordField = reorderVisibleRecordFields({
      fromIndex: sourceIndex + 1,
      toIndex: destinationIndex,
    });

    saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);
  };

  const contextValues: RecordTableHeaderDndKitContextValues = {
    activeDropTargetIndex,
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

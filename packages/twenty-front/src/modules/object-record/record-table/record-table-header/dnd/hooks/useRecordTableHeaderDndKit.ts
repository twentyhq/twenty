import { type DragDropProvider } from '@dnd-kit/react';
import { type ComponentProps, useState } from 'react';
import { filterOutByProperty, isDefined } from 'twenty-shared/utils';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { resolveDragDropItemDrop } from '@/ui/utilities/drag-and-drop/utils/resolveDragDropItemDrop';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropItemData>>['onDragStart']
  >
>[0];
type DragMovePayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropItemData>>['onDragMove']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropItemData>>['onDragEnd']
  >
>[0];

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
  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();
  const { reorderVisibleRecordFields } =
    useReorderVisibleRecordFields(recordTableId);
  const { saveViewFields } = useSaveCurrentViewFields();
  const { setDragSelectionStartEnabled } = useDragSelect();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );
  const isRecordTableCheckboxColumnHidden = useAtomComponentStateValue(
    isRecordTableCheckboxColumnHiddenComponentState,
  );

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
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

  const resolveDropFromPointerX = ({
    pointerX,
    sourceIndex,
  }: {
    pointerX: number;
    sourceIndex: number;
  }) => {
    const { scrollWrapperElement } = getScrollWrapperElement();
    if (!isDefined(scrollWrapperElement)) return null;

    return resolveDragDropItemDrop({
      pointerX,
      sourceIndex,
      scrollWrapperElement,
      columnWidths: recordFieldsWithoutLabelIdentifier.map(
        (recordField) => recordField.size,
      ),
      leadingOffset: nonSortableColumnsWidth,
    });
  };

  const handleDragStart = (_event: DragStartPayload) => {
    setActiveDropTargetIndex(null);
  };

  const handleDragMove = (event: DragMovePayload) => {
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
  };

  const handleDragEnd = (event: DragEndPayload) => {
    const { operation } = event;
    const source = operation.source;

    setActiveDropTargetIndex(null);
    setDragSelectionStartEnabled(true);

    if (event.canceled) return;
    if (!isDefined(source)) return;

    const sourceIndex = source.data.index;
    const resolvedDrop = resolveDropFromPointerX({
      pointerX: operation.position.current.x,
      sourceIndex,
    });

    if (!isDefined(resolvedDrop)) return;
    if (resolvedDrop.sourceIndex === resolvedDrop.destinationIndex) return;

    // Sortable indices exclude the pinned label-identifier column at visibleRecordFields[0],
    // so shift by one to address the full visible field list.
    const updatedRecordField = reorderVisibleRecordFields({
      fromIndex: resolvedDrop.sourceIndex + 1,
      toIndex: resolvedDrop.destinationIndex + 1,
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

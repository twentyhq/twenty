import { type DragDropProvider } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ComponentProps, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessCalendarCardDrop } from '@/object-record/record-drag/hooks/useProcessCalendarCardDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { type DragDropColumnData } from '@/ui/utilities/drag-and-drop/types/DragDropColumnData';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { resolveDropFromPointerY } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointerY';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropColumnData>>['onDragStart']
  >
>[0];
type DragMovePayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropColumnData>>['onDragMove']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DragDropColumnData>>['onDragEnd']
  >
>[0];

export type RecordCalendarDndKitContextValues = {
  activeDropTargetIndex: number | null;
  activeDroppableId: string | null;
};

export const useRecordCalendarDndKit = (): {
  contextValues: RecordCalendarDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragMove: (event: DragMovePayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const store = useStore();

  const { userTimezone } = useUserTimezone();

  const { startRecordDrag } = useStartRecordDrag();
  const { endRecordDrag } = useEndRecordDrag();
  const { processCalendarCardDrop } = useProcessCalendarCardDrop();

  const calendarDayRecordIdsSelector =
    useAtomComponentFamilySelectorCallbackState(
      calendarDayRecordIdsComponentFamilySelector,
    );

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);

  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(
    null,
  );

  const getDroppableItemCount = (droppableId: string) =>
    store.get(
      calendarDayRecordIdsSelector({
        day: Temporal.PlainDate.from(droppableId),
        timeZone: userTimezone,
      }),
    ).length;

  const clearDragState = () => {
    endRecordDrag();
    setActiveDropTargetIndex(null);
    setActiveDroppableId(null);
  };

  const handleDragStart = (event: DragStartPayload) => {
    const draggedRecordId = event.operation.source?.id;

    if (!isDefined(draggedRecordId)) {
      return;
    }

    startRecordDrag(String(draggedRecordId), []);
  };

  const handleDragMove = (event: DragMovePayload) => {
    const { target, position } = event.operation;

    const resolvedDrop = resolveDropFromPointerY({
      target,
      pointerY: position.current.y,
      getDroppableItemCount,
    });

    if (!isDefined(resolvedDrop)) {
      setActiveDropTargetIndex(null);
      setActiveDroppableId(null);
      return;
    }

    setActiveDropTargetIndex(resolvedDrop.dropTargetIndex);
    setActiveDroppableId(resolvedDrop.droppableId);
  };

  const handleDragEnd = (event: DragEndPayload) => {
    const { source, target, position } = event.operation;

    if (event.canceled || !isDefined(source)) {
      clearDragState();
      return;
    }

    const sourceId = String(source.id);
    const sourceDroppableId = (source.data as DragDropColumnData).droppableId;
    const sourceIndex = (source.data as DragDropColumnData).index;

    const resolvedDrop = resolveDropFromPointerY({
      target,
      pointerY: position.current.y,
      getDroppableItemCount,
    });
    if (!isDefined(resolvedDrop)) {
      clearDragState();
      return;
    }

    const destinationDroppableId = resolvedDrop.droppableId;

    const destinationIndex = getDestinationIndex({
      dropTargetIndex: resolvedDrop.dropTargetIndex,
      sourceIndex,
      sourceDroppableId,
      destinationDroppableId,
    });

    const isSameDay = sourceDroppableId === destinationDroppableId;

    if (isSameDay && destinationIndex === sourceIndex) {
      clearDragState();
      return;
    }

    processCalendarCardDrop({
      recordId: sourceId,
      destinationDate: destinationDroppableId,
      destinationIndex,
    });

    clearDragState();
  };

  const contextValues: RecordCalendarDndKitContextValues = {
    activeDropTargetIndex,
    activeDroppableId,
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

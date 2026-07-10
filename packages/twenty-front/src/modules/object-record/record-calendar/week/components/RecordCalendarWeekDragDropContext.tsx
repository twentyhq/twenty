import { useProcessRecordCalendarWeekEventDrop } from '@/object-record/record-calendar/week/hooks/useProcessRecordCalendarWeekEventDrop';
import { type RecordCalendarWeekDndData } from '@/object-record/record-calendar/week/types/RecordCalendarWeekDndData';
import { resolveRecordCalendarWeekEventDrop } from '@/object-record/record-calendar/week/utils/resolveRecordCalendarWeekEventDrop';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropProvider } from '@dnd-kit/react';
import {
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useState,
} from 'react';
import type { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordCalendarWeekDndData>
    >['onDragStart']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<
      typeof DragDropProvider<RecordCalendarWeekDndData>
    >['onDragEnd']
  >
>[0];

type RecordCalendarWeekDragDropContextProps = {
  children: ReactNode;
  gridRef: RefObject<HTMLDivElement | null>;
  weekDays: Temporal.PlainDate[];
};

export const RecordCalendarWeekDragDropContext = ({
  children,
  gridRef,
  weekDays,
}: RecordCalendarWeekDragDropContextProps) => {
  const [grabOffsetY, setGrabOffsetY] = useState(0);
  const { processRecordCalendarWeekEventDrop } =
    useProcessRecordCalendarWeekEventDrop();

  const handleDragStart = ({ operation }: DragStartPayload) => {
    const sourceElement = operation.source?.element;

    if (!isDefined(sourceElement)) {
      setGrabOffsetY(0);
      return;
    }

    setGrabOffsetY(
      operation.position.current.y - sourceElement.getBoundingClientRect().top,
    );
  };

  const handleDragEnd = ({ canceled, operation }: DragEndPayload) => {
    if (
      canceled ||
      !isDefined(operation.source) ||
      !isDefined(gridRef.current)
    ) {
      return;
    }

    const sourceData = operation.source.data;

    if (sourceData.kind !== 'record-calendar-week-event') {
      return;
    }

    const gridRect = gridRef.current.getBoundingClientRect();
    const resolvedDrop = resolveRecordCalendarWeekEventDrop({
      dayCount: weekDays.length,
      grabOffsetY,
      gridRect,
      pointerX: operation.position.current.x,
      pointerY: operation.position.current.y,
    });

    if (!isDefined(resolvedDrop)) {
      return;
    }

    const destinationDay = weekDays[resolvedDrop.dayIndex];

    if (!isDefined(destinationDay)) {
      return;
    }

    void processRecordCalendarWeekEventDrop({
      destinationDay,
      destinationMinutes: resolvedDrop.destinationMinutes,
      recordId: sourceData.recordId,
    });
  };

  return (
    <DragDropProvider<RecordCalendarWeekDndData>
      sensors={DND_KIT_SENSORS}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DragDropProvider>
  );
};

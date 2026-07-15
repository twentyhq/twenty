import { useProcessRecordCalendarWeekEventDrop } from '@/object-record/record-calendar/week/hooks/useProcessRecordCalendarWeekEventDrop';
import { type RecordCalendarWeekDndData } from '@/object-record/record-calendar/week/types/RecordCalendarWeekDndData';
import { resolveRecordCalendarWeekEventDrop } from '@/object-record/record-calendar/week/utils/resolveRecordCalendarWeekEventDrop';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropProvider } from '@dnd-kit/react';
import { t } from '@lingui/core/macro';
import {
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useState,
} from 'react';
import type { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { logError } from '~/utils/logError';

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
  days: Temporal.PlainDate[];
  gridRef: RefObject<HTMLDivElement | null>;
};

export const RecordCalendarWeekDragDropContext = ({
  children,
  days,
  gridRef,
}: RecordCalendarWeekDragDropContextProps) => {
  const [grabOffsetY, setGrabOffsetY] = useState(0);
  const { processRecordCalendarWeekEventDrop } =
    useProcessRecordCalendarWeekEventDrop();
  const { enqueueErrorSnackBar } = useSnackBar();

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
      dayCount: days.length,
      grabOffsetY,
      gridRect,
      pointerX: operation.position.current.x,
      pointerY: operation.position.current.y,
    });

    if (!isDefined(resolvedDrop)) {
      return;
    }

    const destinationDay = days[resolvedDrop.dayIndex];

    if (!isDefined(destinationDay)) {
      return;
    }

    void processRecordCalendarWeekEventDrop({
      destinationDay,
      destinationMinutes: resolvedDrop.destinationMinutes,
      recordId: sourceData.recordId,
    }).catch((error) => {
      logError(error);
      enqueueErrorSnackBar({ message: t`Failed to move record` });
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

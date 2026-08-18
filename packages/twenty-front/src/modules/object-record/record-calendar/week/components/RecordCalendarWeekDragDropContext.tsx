import { recordCalendarSelectedRecordIdsComponentSelector } from '@/object-record/record-calendar/states/selectors/recordCalendarSelectedRecordIdsComponentSelector';
import { useProcessRecordCalendarWeekEventDrop } from '@/object-record/record-calendar/week/hooks/useProcessRecordCalendarWeekEventDrop';
import { type RecordCalendarWeekDndData } from '@/object-record/record-calendar/week/types/RecordCalendarWeekDndData';
import { resolveRecordCalendarWeekEventDrop } from '@/object-record/record-calendar/week/utils/resolveRecordCalendarWeekEventDrop';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { DragDropProvider } from '@dnd-kit/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { type ReactNode, type RefObject, useState } from 'react';
import type { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { logError } from '~/utils/logError';

type DragStartPayload =
  DragDropProviderDragStartEvent<RecordCalendarWeekDndData>;
type DragEndPayload = DragDropProviderDragEndEvent<RecordCalendarWeekDndData>;

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

  const store = useStore();
  const { startRecordDrag } = useStartRecordDrag();
  const { endRecordDrag } = useEndRecordDrag();

  const recordCalendarSelectedRecordIds = useAtomComponentSelectorCallbackState(
    recordCalendarSelectedRecordIdsComponentSelector,
  );

  const originalDragSelectionCallbackState = useAtomComponentStateCallbackState(
    originalDragSelectionComponentState,
  );

  const handleDragStart = ({ operation }: DragStartPayload) => {
    const source = operation.source;
    const sourceData = source?.data;

    if (!isDefined(sourceData)) {
      return;
    }

    const currentSelectedRecordIds = store.get(recordCalendarSelectedRecordIds);
    startRecordDrag(sourceData.recordId, currentSelectedRecordIds);

    const sourceElement = source?.element;

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
      endRecordDrag();
      return;
    }

    const sourceData = operation.source.data;

    if (sourceData.kind !== 'record-calendar-week-event') {
      endRecordDrag();
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
      endRecordDrag();
      return;
    }

    const destinationDay = days[resolvedDrop.dayIndex];

    if (!isDefined(destinationDay)) {
      endRecordDrag();
      return;
    }

    const originalDragSelection = store.get(originalDragSelectionCallbackState);

    void processRecordCalendarWeekEventDrop({
      destinationDay,
      destinationMinutes: resolvedDrop.destinationMinutes,
      recordId: sourceData.recordId,
      selectedRecordIds: originalDragSelection,
    }).catch((error) => {
      logError(error);
      enqueueErrorSnackBar({ message: t`Failed to move record` });
    });

    endRecordDrag();
  };

  return (
    <DragDropProvider<RecordCalendarWeekDndData>
      sensors={DND_KIT_SENSORS}
      plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DragDropProvider>
  );
};

export type RecordCalendarWeekEventLayoutInput = {
  endInPixels: number;
  recordId: string;
  startInPixels: number;
};

export type RecordCalendarWeekEventLayout =
  RecordCalendarWeekEventLayoutInput & {
    columnCount: number;
    columnIndex: number;
  };

const layoutOverlappingEventGroup = (
  events: RecordCalendarWeekEventLayoutInput[],
): RecordCalendarWeekEventLayout[] => {
  const columnEndPositions: number[] = [];

  const layouts = events.map((event) => {
    const availableColumnIndex = columnEndPositions.findIndex(
      (endInPixels) => endInPixels <= event.startInPixels,
    );

    const columnIndex =
      availableColumnIndex === -1
        ? columnEndPositions.length
        : availableColumnIndex;

    columnEndPositions[columnIndex] = event.endInPixels;

    return {
      ...event,
      columnCount: 0,
      columnIndex,
    };
  });

  const columnCount = columnEndPositions.length;

  return layouts.map((layout) => ({
    ...layout,
    columnCount,
  }));
};

export const computeRecordCalendarWeekEventLayouts = (
  events: RecordCalendarWeekEventLayoutInput[],
): RecordCalendarWeekEventLayout[] => {
  const sortedEvents = [...events].sort(
    (eventA, eventB) =>
      eventA.startInPixels - eventB.startInPixels ||
      eventB.endInPixels - eventA.endInPixels ||
      eventA.recordId.localeCompare(eventB.recordId),
  );

  const overlappingEventGroups: RecordCalendarWeekEventLayoutInput[][] = [];
  let currentGroup: RecordCalendarWeekEventLayoutInput[] = [];
  let currentGroupEndInPixels = Number.NEGATIVE_INFINITY;

  for (const event of sortedEvents) {
    if (
      currentGroup.length > 0 &&
      event.startInPixels >= currentGroupEndInPixels
    ) {
      overlappingEventGroups.push(currentGroup);
      currentGroup = [];
      currentGroupEndInPixels = Number.NEGATIVE_INFINITY;
    }

    currentGroup.push(event);
    currentGroupEndInPixels = Math.max(
      currentGroupEndInPixels,
      event.endInPixels,
    );
  }

  if (currentGroup.length > 0) {
    overlappingEventGroups.push(currentGroup);
  }

  return overlappingEventGroups.flatMap(layoutOverlappingEventGroup);
};

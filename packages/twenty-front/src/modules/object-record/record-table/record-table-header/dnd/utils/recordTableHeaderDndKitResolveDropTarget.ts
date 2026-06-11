type RecordTableHeaderDroppableData = {
  droppableId: string;
  index: number;
  insertBeforeItemId?: string;
};

type RecordTableHeaderResolvedDropTarget = {
  destination: {
    droppableId: string;
    index: number;
  };
  dropTargetId: string;
};

const isRecordTableHeaderDroppableData = (
  data: unknown,
): data is RecordTableHeaderDroppableData =>
  typeof data === 'object' &&
  data !== null &&
  (data as RecordTableHeaderDroppableData).droppableId ===
    'record-table-header-droppable' &&
  typeof (data as RecordTableHeaderDroppableData).index === 'number';

export const resolveRecordTableHeaderDropTarget = (
  target: {
    id?: unknown;
    group?: unknown;
    index?: unknown;
    data?: unknown;
  } | null,
): RecordTableHeaderResolvedDropTarget | null => {
  if (target == null) {
    return null;
  }

  if (isRecordTableHeaderDroppableData(target.data)) {
    return {
      destination: {
        droppableId: target.data.droppableId,
        index: target.data.index,
      },
      dropTargetId: String(target.id),
    };
  }

  if (
    target.group === 'record-table-header-droppable' &&
    typeof target.index === 'number'
  ) {
    return {
      destination: {
        droppableId: 'record-table-header-droppable',
        index: target.index,
      },
      dropTargetId: `${'record-table-header-droppable'}::${target.index}`,
    };
  }

  return null;
};

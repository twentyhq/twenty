export type DragOperationType = 'single' | 'multi';

export type RecordPositionData = {
  recordId: string;
  position?: number;
};

export type RecordUpdate = {
  recordId: string;
  position: number;
};

export type MultiDragResult = {
  recordUpdates: RecordUpdate[];
};

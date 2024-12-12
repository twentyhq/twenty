import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { createContext } from 'react';

export type RecordTableRowDraggableContextProps = {
  inView?: boolean;
  isDragDisabled?: boolean;
  isDragging: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
};

export const RecordTableRowDraggableContext =
  createContext<RecordTableRowDraggableContextProps>(
    {} as RecordTableRowDraggableContextProps,
  );

import { createContext } from 'react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

export type RecordTableRowContextProps = {
  pathToShowPage: string;
  objectNameSingular: string;
  recordId: string;
  rowIndex: number;
  isSelected: boolean;
  isReadOnly: boolean;
  isPendingRow?: boolean;
  isDragging: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  inView?: boolean;
};

export const RecordTableRowContext = createContext<RecordTableRowContextProps>(
  {} as RecordTableRowContextProps,
);

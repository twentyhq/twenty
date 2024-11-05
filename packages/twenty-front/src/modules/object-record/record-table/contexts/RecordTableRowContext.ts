import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { createContext } from 'react';

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
  cellWidths: number[];
};

export const RecordTableRowContext = createContext<RecordTableRowContextProps>(
  {} as RecordTableRowContextProps,
);

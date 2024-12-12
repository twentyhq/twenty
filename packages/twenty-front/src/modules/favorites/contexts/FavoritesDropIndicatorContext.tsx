import { createContext } from 'react';

export type DropIndicatorState = {
  droppableId: string | null;
  index: number | null;
  isDragging: boolean;
  sourceDroppableId: string | null;
  draggedId: string | null;
};

export const FavoritesDropIndicatorContext = createContext<DropIndicatorState>({
  droppableId: null,
  index: null,
  isDragging: false,
  sourceDroppableId: null,
  draggedId: null,
});

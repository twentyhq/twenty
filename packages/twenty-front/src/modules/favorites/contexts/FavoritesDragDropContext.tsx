import {
  DropIndicatorState,
  FavoritesDropIndicatorContext,
} from '@/favorites/contexts/FavoritesDropIndicatorContext';
import { useReorderFavorite } from '@/favorites/hooks/useReorderFavorite';
import {
  DragDropContext,
  DropResult,
  OnDragUpdateResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';
import { ReactNode, useState } from 'react';

export const FavoritesDragDropContext = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { handleReorderFavorite } = useReorderFavorite();
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState>({
    droppableId: null,
    index: null,
    isDragging: false,
    sourceDroppableId: null,
    draggedId: null,
  });

  const handleDragStart = (start: any) => {
    setDropIndicator((prev) => ({
      ...prev,
      isDragging: true,
      sourceDroppableId: start.source.droppableId,
      draggedId: start.draggableId,
    }));
  };

  const handleDragUpdate: OnDragUpdateResponder = (update) => {
    const destination = update.destination;

    if (!destination) {
      setDropIndicator((prev) => ({
        ...prev,
        droppableId: null,
        index: null,
      }));
      return;
    }

    setDropIndicator((prev) => ({
      ...prev,
      droppableId: destination.droppableId,
      index: destination.index,
    }));
  };
  const handleDragEnd = async (
    result: DropResult,
    provided: ResponderProvided,
  ) => {
    setDropIndicator({
      droppableId: null,
      index: null,
      isDragging: false,
      sourceDroppableId: null,
      draggedId: null,
    });
    await handleReorderFavorite(result, provided);
  };

  return (
    <FavoritesDropIndicatorContext.Provider value={dropIndicator}>
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragUpdate={handleDragUpdate}
        onDragStart={handleDragStart}
      >
        {children}
      </DragDropContext>
    </FavoritesDropIndicatorContext.Provider>
  );
};

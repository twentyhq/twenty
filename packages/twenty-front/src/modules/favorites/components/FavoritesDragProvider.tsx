import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useReorderFavorite } from '@/favorites/hooks/useReorderFavorite';
import {
  DragDropContext,
  DragStart,
  DropResult,
  ResponderProvided,
} from '@hello-pangea/dnd';
import { ReactNode, useState } from 'react';

type FavoritesDragProviderProps = {
  children: ReactNode;
};

export const FavoritesDragProvider = ({
  children,
}: FavoritesDragProviderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { handleReorderFavorite } = useReorderFavorite();

  const handleDragStart = (_: DragStart) => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    handleReorderFavorite(result, provided);
  };

  return (
    <FavoritesDragContext.Provider value={{ isDragging }}>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        {children}
      </DragDropContext>
    </FavoritesDragContext.Provider>
  );
};

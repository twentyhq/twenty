import { FavoritesDragContext } from '@/favorites/contexts/useFavoritesDragContext';
import {
    DragDropContext,
    DragStart,
    DropResult,
    ResponderProvided,
} from '@hello-pangea/dnd';
import { ReactNode, useState } from 'react';

type FavoritesDragProviderProps = {
  children: ReactNode;
  onReorder: (result: DropResult, provided: ResponderProvided) => void;
};

export const FavoritesDragProvider = ({
  children,
  onReorder,
}: FavoritesDragProviderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (_: DragStart) => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    onReorder(result, provided);
  };

  return (
    <FavoritesDragContext.Provider value={{ isDragging }}>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        {children}
      </DragDropContext>
    </FavoritesDragContext.Provider>
  );
};

import { useReorderFavorite } from '@/favorites/hooks/useReorderFavorite';
import { DragDropContext } from '@hello-pangea/dnd';
import { ReactNode } from 'react';

type FavoritesDragDropContextProps = {
  children: ReactNode;
};

export const FavoritesDragDropContext = ({
  children,
}: FavoritesDragDropContextProps) => {
  const { handleReorderFavorite } = useReorderFavorite();

  return (
    <DragDropContext onDragEnd={handleReorderFavorite}>
      {children}
    </DragDropContext>
  );
};

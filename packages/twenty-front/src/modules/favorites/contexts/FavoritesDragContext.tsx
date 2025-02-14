import { createContext } from 'react';

type FavoritesDragContextType = {
  isDragging: boolean;
};

export const FavoritesDragContext = createContext<FavoritesDragContextType>({
  isDragging: false,
});

import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { ReactNode } from 'react';

type FavoriteFolderPickerScopeProps = {
  children: ReactNode;
  favoriteFoldersScopeId: string;
};

export const FavoriteFolderPickerScope = ({
  children,
  favoriteFoldersScopeId,
}: FavoriteFolderPickerScopeProps) => {
  return (
    <FavoriteFolderPickerInstanceContext.Provider
      value={{ instanceId: favoriteFoldersScopeId }}
    >
      {children}
    </FavoriteFolderPickerInstanceContext.Provider>
  );
};

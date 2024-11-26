import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { ReactNode } from 'react';

type FavoriteFolderPickerComponentInstanceContextProps = {
  children: ReactNode;
  favoriteFoldersScopeId: string;
};

export const FavoriteFolderPickerComponentInstanceContext = ({
  children,
  favoriteFoldersScopeId,
}: FavoriteFolderPickerComponentInstanceContextProps) => {
  return (
    <FavoriteFolderPickerInstanceContext.Provider
      value={{ instanceId: favoriteFoldersScopeId }}
    >
      {children}
    </FavoriteFolderPickerInstanceContext.Provider>
  );
};

import { FavoriteFoldersScopeInternalContext } from '@/favorites/scopes/scope-internal-context/favoritesScopeInternalContext';
import { ReactNode } from 'react';

type FavoriteFoldersScopeProps = {
  children: ReactNode;
  favoriteFoldersScopeId: string;
};

export const FavoriteFoldersScope = ({
  children,
  favoriteFoldersScopeId,
}: FavoriteFoldersScopeProps) => {
  return (
    <FavoriteFoldersScopeInternalContext.Provider
      value={{ scopeId: favoriteFoldersScopeId }}
    >
      {children}
    </FavoriteFoldersScopeInternalContext.Provider>
  );
};

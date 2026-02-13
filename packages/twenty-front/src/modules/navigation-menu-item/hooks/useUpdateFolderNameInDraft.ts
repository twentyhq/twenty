import { useSetRecoilState } from 'recoil';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

export const useUpdateFolderNameInDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );

  const updateFolderNameInDraft = (folderId: string, name: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) =>
        isNavigationMenuItemFolder(item) && item.id === folderId
          ? { ...item, name }
          : item,
      );
    });
  };

  return { updateFolderNameInDraft };
};

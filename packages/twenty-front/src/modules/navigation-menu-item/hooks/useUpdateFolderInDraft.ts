import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type UpdateFolderInDraftUpdates = {
  name?: string;
  icon?: string;
};

export const useUpdateFolderInDraft = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );

  const updateFolderInDraft = (
    folderId: string,
    updates: UpdateFolderInDraftUpdates,
  ) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) => {
        if (!isNavigationMenuItemFolder(item) || item.id !== folderId) {
          return item;
        }
        return { ...item, ...updates };
      });
    });
  };

  return { updateFolderInDraft };
};

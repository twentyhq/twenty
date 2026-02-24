import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type UpdateFolderInDraftUpdates = {
  name?: string;
  icon?: string;
};

export const useUpdateFolderInDraft = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftStateV2,
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

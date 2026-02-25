import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

export const useUpdateFolderNameInDraft = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftStateV2,
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

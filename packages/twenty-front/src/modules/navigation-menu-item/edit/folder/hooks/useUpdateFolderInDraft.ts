import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

export type UpdateFolderInDraftUpdates = {
  name?: string;
  icon?: string;
};

export const useUpdateFolderInDraft = () => {
  const { applyUpdate } = useNavigationMenuItemEditController();

  const updateFolderInDraft = (
    folderId: string,
    updates: UpdateFolderInDraftUpdates,
  ) => {
    void applyUpdate(folderId, updates);
  };

  return { updateFolderInDraft };
};

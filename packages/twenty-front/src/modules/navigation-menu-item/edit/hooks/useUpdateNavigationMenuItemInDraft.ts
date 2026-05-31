import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

export type UpdateNavigationMenuItemInDraftUpdates = {
  color?: string;
  name?: string;
  icon?: string;
  link?: string;
};

export const useUpdateNavigationMenuItemInDraft = () => {
  const { applyUpdate } = useNavigationMenuItemEditController();

  const updateNavigationMenuItemInDraft = (
    navigationMenuItemId: string,
    updates: UpdateNavigationMenuItemInDraftUpdates,
  ) => {
    void applyUpdate(navigationMenuItemId, updates);
  };

  return { updateNavigationMenuItemInDraft };
};

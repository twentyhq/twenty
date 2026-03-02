import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type UpdateNavigationMenuItemInDraftUpdates = {
  color?: string;
  name?: string;
  icon?: string;
  link?: string;
};

export const useUpdateNavigationMenuItemInDraft = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );

  const updateNavigationMenuItemInDraft = (
    navigationMenuItemId: string,
    updates: UpdateNavigationMenuItemInDraftUpdates,
  ) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) =>
        item.id === navigationMenuItemId ? { ...item, ...updates } : item,
      );
    });
  };

  return { updateNavigationMenuItemInDraft };
};

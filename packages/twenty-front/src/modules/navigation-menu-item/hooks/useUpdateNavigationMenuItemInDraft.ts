import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export type UpdateNavigationMenuItemInDraftUpdates = {
  color?: string;
  name?: string;
  icon?: string;
  link?: string;
};

export const useUpdateNavigationMenuItemInDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilStateV2(
    navigationMenuItemsDraftStateV2,
  );

  const updateNavigationMenuItemInDraft = (
    navigationMenuItemId: string,
    updates: UpdateNavigationMenuItemInDraftUpdates,
  ) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) => {
        if (item.id !== navigationMenuItemId) return item;
        return { ...item, ...updates };
      });
    });
  };

  return { updateNavigationMenuItemInDraft };
};

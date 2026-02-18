import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';

export const useUpdateLinkInDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilStateV2(
    navigationMenuItemsDraftStateV2,
  );

  const updateLinkInDraft = (
    linkId: string,
    updates: { name?: string; link?: string },
  ) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) => {
        if (item.id !== linkId || !isNavigationMenuItemLink(item)) return item;

        const updated = { ...item };
        if (updates.name !== undefined) {
          updated.name = updates.name.trim() || 'Link';
        }
        if (updates.link !== undefined && updates.link.trim() !== '') {
          updated.link = updates.link.trim();
        }
        return updated;
      });
    });
  };

  return { updateLinkInDraft };
};

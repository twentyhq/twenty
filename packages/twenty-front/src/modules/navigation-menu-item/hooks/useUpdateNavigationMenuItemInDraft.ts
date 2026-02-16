import { useSetRecoilState } from 'recoil';

import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';

export type UpdateNavigationMenuItemInDraftUpdates = Partial<
  Pick<NavigationMenuItem, 'color'>
>;

export const useUpdateNavigationMenuItemInDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
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

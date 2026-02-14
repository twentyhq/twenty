import { useSetRecoilState } from 'recoil';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { type View } from '@/views/types/View';

export const useUpdateViewInDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );

  const updateViewInDraft = (navigationMenuItemId: string, view: View) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) =>
        item.id === navigationMenuItemId
          ? {
              ...item,
              viewId: view.id,
              targetObjectMetadataId: undefined,
              targetRecordId: undefined,
            }
          : item,
      );
    });
  };

  return { updateViewInDraft };
};

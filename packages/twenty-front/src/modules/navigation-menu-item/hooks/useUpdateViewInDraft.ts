import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { type View } from '@/views/types/View';

export const useUpdateViewInDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilStateV2(
    navigationMenuItemsDraftStateV2,
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

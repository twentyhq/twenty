import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type View } from '@/views/types/View';

export const useUpdateViewInDraft = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
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

import { FavoriteFolderPicker } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPicker';
import { FavoriteFolderPickerEffect } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerEffect';
import { FavoriteFolderPickerComponentInstanceContext } from '@/favorites/favorite-folder-picker/scopes/FavoriteFolderPickerScope';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { View } from '@/views/types/View';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

export const ViewPickerFavoriteFoldersDropdown = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const [viewPickerReferenceViewId] = useRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );

  const view = views.find((view) => view.id === viewPickerReferenceViewId);

  return (
    <FavoriteFolderPickerComponentInstanceContext
      favoriteFoldersScopeId={VIEW_PICKER_DROPDOWN_ID}
    >
      <DropdownScope dropdownScopeId={VIEW_PICKER_DROPDOWN_ID}>
        <>
          <FavoriteFolderPickerEffect record={view} />
          <FavoriteFolderPicker
            record={view}
            objectNameSingular="view"
            dropdownId={VIEW_PICKER_DROPDOWN_ID}
          />
        </>
      </DropdownScope>
    </FavoriteFolderPickerComponentInstanceContext>
  );
};

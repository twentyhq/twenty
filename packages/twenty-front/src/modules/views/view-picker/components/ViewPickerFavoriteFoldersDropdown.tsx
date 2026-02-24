import { FavoriteFolderPicker } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPicker';
import { FavoriteFolderPickerEffect } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerEffect';
import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

export const ViewPickerFavoriteFoldersDropdown = () => {
  const [viewPickerReferenceViewId] = useRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );

  const view = useFamilySelectorValueV2(coreViewFromViewIdFamilySelector, {
    viewId: viewPickerReferenceViewId ?? '',
  });

  return (
    <FavoriteFolderPickerInstanceContext.Provider
      value={{ instanceId: VIEW_PICKER_DROPDOWN_ID }}
    >
      <FavoriteFolderPickerEffect record={view} />
      <FavoriteFolderPicker
        record={view}
        objectNameSingular="view"
        dropdownId={VIEW_PICKER_DROPDOWN_ID}
      />
    </FavoriteFolderPickerInstanceContext.Provider>
  );
};

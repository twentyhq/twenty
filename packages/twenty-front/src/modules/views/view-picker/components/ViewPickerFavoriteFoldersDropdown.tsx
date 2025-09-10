import { FavoriteFolderPicker } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPicker';
import { FavoriteFolderPickerEffect } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerEffect';
import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useRecoilValue } from 'recoil';

export const ViewPickerFavoriteFoldersDropdown = () => {
  const [viewPickerReferenceViewId] = useRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
  );

  const view = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: viewPickerReferenceViewId ?? '',
    }),
  );

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

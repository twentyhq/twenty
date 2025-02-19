import { FavoriteFolderPicker } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPicker';
import { FavoriteFolderPickerEffect } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerEffect';
import { FavoriteFolderPickerComponentInstanceContext } from '@/favorites/favorite-folder-picker/scopes/FavoriteFolderPickerScope';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useRecoilValue } from 'recoil';

export const ViewPickerFavoriteFoldersDropdown = () => {
  const [viewPickerReferenceViewId] = useRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );

  const view = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: viewPickerReferenceViewId ?? '',
    }),
  );

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

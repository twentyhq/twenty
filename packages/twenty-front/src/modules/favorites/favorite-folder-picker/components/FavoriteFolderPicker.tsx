import { FavoriteFolderPickerFooter } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerFooter';
import { FavoriteFolderPickerList } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerList';
import { FavoriteFolderPickerSearchInput } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerSearchInput';
import { useFavoriteFolderPicker } from '@/favorites/favorite-folder-picker/hooks/useFavoriteFolderPicker';
import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { favoriteFolderSearchFilterComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFoldersSearchFilterComponentState';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

type FavoriteFolderPickerProps = {
  onSubmit?: () => void;
  record?: ObjectRecord;
  objectNameSingular: string;
  dropdownId: string;
};

const NO_FOLDER_ID = 'no-folder';

export const FavoriteFolderPicker = ({
  onSubmit,
  record,
  objectNameSingular,
  dropdownId,
}: FavoriteFolderPickerProps) => {
  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilState(isFavoriteFolderCreatingState);

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    FavoriteFolderPickerInstanceContext,
  );

  const { favoriteFolders, toggleFolderSelection } = useFavoriteFolderPicker({
    record,
    objectNameSingular,
  });

  const [favoriteFoldersSearchFilter] = useRecoilComponentState(
    favoriteFolderSearchFilterComponentState,
  );

  const filteredFolders = favoriteFolders.filter((folder) =>
    folder.name
      .toLowerCase()
      .includes(favoriteFoldersSearchFilter.toLowerCase()),
  );

  const showNoFolderOption =
    !favoriteFoldersSearchFilter ||
    'no folder'.includes(favoriteFoldersSearchFilter.toLowerCase());

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      if (isFavoriteFolderCreating) {
        setIsFavoriteFolderCreating(false);
        return;
      }
      onSubmit?.();
    },
    focusId: dropdownId,
    dependencies: [onSubmit, isFavoriteFolderCreating],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: () => {
      if (filteredFolders.length === 1 && !showNoFolderOption) {
        toggleFolderSelection(filteredFolders[0].id);
        onSubmit?.();
        return;
      }

      if (showNoFolderOption && filteredFolders.length === 0) {
        toggleFolderSelection(NO_FOLDER_ID);
        onSubmit?.();
        return;
      }
    },
    focusId: instanceId,
    dependencies: [
      filteredFolders,
      showNoFolderOption,
      toggleFolderSelection,
      onSubmit,
    ],
  });

  return (
    <DropdownContent>
      <FavoriteFolderPickerSearchInput />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <FavoriteFolderPickerList
          folders={favoriteFolders}
          toggleFolderSelection={toggleFolderSelection}
        />
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <FavoriteFolderPickerFooter dropdownId={dropdownId} />
    </DropdownContent>
  );
};

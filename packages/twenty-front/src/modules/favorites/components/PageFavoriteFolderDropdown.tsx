import { PageFavoriteButton } from '@/favorites/components/PageFavoriteButton';
import { FavoriteFolderPicker } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPicker';
import { FavoriteFolderPickerEffect } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerEffect';
import { FavoriteFolderPickerComponentInstanceContext } from '@/favorites/favorite-folder-picker/scopes/FavoriteFolderPickerScope';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { isDefined } from '@ui/utilities/isDefined';

type PageFavoriteFoldersDropdownProps = {
  dropdownId: string;
  isFavorite: boolean;
  record?: ObjectRecord;
  objectNameSingular: string;
};

export const PageFavoriteFoldersDropdown = ({
  dropdownId,
  isFavorite,
  record,
  objectNameSingular,
}: PageFavoriteFoldersDropdownProps) => {
  const { closeDropdown } = useDropdown(dropdownId);
  const { createFavorite } = useCreateFavorite();

  const handleAddToFavorites = () => {
    if (!isFavorite && isDefined(record)) {
      createFavorite(record, objectNameSingular);
    }
  };

  return (
    <FavoriteFolderPickerComponentInstanceContext
      favoriteFoldersScopeId={dropdownId}
    >
      <DropdownScope dropdownScopeId={dropdownId}>
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-start"
          clickableComponent={
            <PageFavoriteButton
              isFavorite={isFavorite}
              onClick={handleAddToFavorites}
            />
          }
          dropdownComponents={
            <>
              <FavoriteFolderPickerEffect record={record} />
              <FavoriteFolderPicker
                onSubmit={closeDropdown}
                record={record}
                objectNameSingular={objectNameSingular}
                dropdownId={dropdownId}
              />
            </>
          }
          dropdownHotkeyScope={{
            scope: dropdownId,
          }}
        />
      </DropdownScope>
    </FavoriteFolderPickerComponentInstanceContext>
  );
};

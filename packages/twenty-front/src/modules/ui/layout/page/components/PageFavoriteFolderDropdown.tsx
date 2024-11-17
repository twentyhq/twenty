import { FavoriteFolderPicker } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPicker';
import { FavoriteFolderPickerEffect } from '@/favorites/favorite-folder-picker/components/FavoriteFolderPickerEffect';
import { FavoriteFolderPickerScope } from '@/favorites/favorite-folder-picker/scopes/FavoriteFolderPickerScope';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { PageFavoriteButton } from '@/ui/layout/page/components/PageFavoriteButton';

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

  return (
    <FavoriteFolderPickerScope favoriteFoldersScopeId={dropdownId}>
      <DropdownScope dropdownScopeId={dropdownId}>
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-start"
          clickableComponent={<PageFavoriteButton isFavorite={isFavorite} />}
          dropdownComponents={
            <>
              <FavoriteFolderPickerEffect record={record} />
              <FavoriteFolderPicker
                onSubmit={closeDropdown}
                record={record}
                objectNameSingular={objectNameSingular}
              />
            </>
          }
          dropdownHotkeyScope={{
            scope: dropdownId,
          }}
        />
      </DropdownScope>
    </FavoriteFolderPickerScope>
  );
};

import { useCallback } from 'react';

import { FavoriteFoldersMultiSelect } from '@/favorites/components/FavoriteFoldersMultiSelect';
import { FavoriteFoldersMultiSelectEffect } from '@/favorites/components/FavoriteFoldersSelectEffects';
import { FavoriteFoldersScope } from '@/favorites/scopes/FavoriteFoldersScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { PageFavoriteButton } from '@/ui/layout/page/components/PageFavoriteButton';

type FavoriteFoldersDropdownProps = {
  dropdownId: string;
  isFavorite: boolean;
  onRemoveFavorite: () => void;
};

export const FavoriteFoldersDropdown = ({
  dropdownId,
  isFavorite,
  onRemoveFavorite,
}: FavoriteFoldersDropdownProps) => {
  const { closeDropdown } = useDropdown(dropdownId);

  const handleFavoriteClick = useCallback(() => {
    if (isFavorite) {
      onRemoveFavorite();
      closeDropdown();
    }
  }, [isFavorite, onRemoveFavorite, closeDropdown]);

  return (
    <FavoriteFoldersScope favoriteFoldersScopeId={dropdownId}>
      <DropdownScope dropdownScopeId={dropdownId}>
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-start"
          clickableComponent={
            <PageFavoriteButton
              isFavorite={isFavorite}
              onClick={handleFavoriteClick}
            />
          }
          dropdownComponents={
            <>
              <FavoriteFoldersMultiSelectEffect />
              <FavoriteFoldersMultiSelect onSubmit={closeDropdown} />
            </>
          }
          dropdownHotkeyScope={{
            scope: dropdownId,
          }}
        />
      </DropdownScope>
    </FavoriteFoldersScope>
  );
};

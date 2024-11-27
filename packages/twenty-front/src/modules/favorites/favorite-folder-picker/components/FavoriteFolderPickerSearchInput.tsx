import { favoriteFolderSearchFilterComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFoldersSearchFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const FavoriteFolderPickerSearchInput = () => {
  const [favoriteFoldersSearchFilter, setFavoriteFoldersSearchFilter] =
    useRecoilComponentStateV2(favoriteFolderSearchFilterComponentState);

  const debouncedSetSearchFilter = useDebouncedCallback(
    setFavoriteFoldersSearchFilter,
    100,
    { leading: true },
  );

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchFilter(event.currentTarget.value);
    },
    [debouncedSetSearchFilter],
  );

  return (
    <DropdownMenuSearchInput
      value={favoriteFoldersSearchFilter}
      onChange={handleFilterChange}
      autoFocus
    />
  );
};

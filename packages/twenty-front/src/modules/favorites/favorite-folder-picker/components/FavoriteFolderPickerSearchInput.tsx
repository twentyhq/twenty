import { favoriteFolderSearchFilterComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFoldersSearchFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const FavoriteFolderPickerSearchInput = () => {
  const [favoriteFoldersSearchFilter, setFavoriteFoldersSearchFilter] =
    useRecoilComponentState(favoriteFolderSearchFilterComponentState);

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

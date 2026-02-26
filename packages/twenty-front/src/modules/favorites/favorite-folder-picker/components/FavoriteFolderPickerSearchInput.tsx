import { favoriteFolderSearchFilterComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFoldersSearchFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const FavoriteFolderPickerSearchInput = () => {
  const [favoriteFolderSearchFilter, setFavoriteFolderSearchFilter] =
    useAtomComponentState(favoriteFolderSearchFilterComponentState);

  const debouncedSetSearchFilter = useDebouncedCallback(
    setFavoriteFolderSearchFilter,
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
      value={favoriteFolderSearchFilter}
      onChange={handleFilterChange}
      autoFocus
    />
  );
};

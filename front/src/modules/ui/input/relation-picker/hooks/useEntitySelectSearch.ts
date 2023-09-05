import { useEffect } from 'react';
import debounce from 'lodash.debounce';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { relationPickerHoverIndexScopedState } from '../states/relationPickerHoverIndexScopedState';
import { relationPickerSearchFilterScopedState } from '../states/relationPickerSearchFilterScopedState';

export function useEntitySelectSearch() {
  const [, setRelationPickerHoverIndex] = useRecoilScopedState(
    relationPickerHoverIndexScopedState,
  );

  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(relationPickerSearchFilterScopedState);

  const debouncedSetSearchFilter = debounce(
    setRelationPickerSearchFilter,
    100,
    {
      leading: true,
    },
  );

  function handleSearchFilterChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    debouncedSetSearchFilter(event.currentTarget.value);
    setRelationPickerHoverIndex(0);
  }

  useEffect(() => {
    setRelationPickerSearchFilter('');
  }, [setRelationPickerSearchFilter]);

  return {
    relationPickerSearchFilter,
    handleSearchFilterChange,
  };
}

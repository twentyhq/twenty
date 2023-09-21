import { useEffect } from 'react';
import debounce from 'lodash.debounce';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { RelationPickerRecoilScopeContext } from '../states/recoil-scope-contexts/RelationPickerRecoilScopeContext';
import { relationPickerHoveredIdScopedState } from '../states/relationPickerPreselectedIdScopedState';
import { relationPickerSearchFilterScopedState } from '../states/relationPickerSearchFilterScopedState';

export const useEntitySelectSearch = () => {
  const [, setRelationPickerHoveredId] = useRecoilScopedState(
    relationPickerHoveredIdScopedState,
    RelationPickerRecoilScopeContext,
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

  const handleSearchFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    debouncedSetSearchFilter(event.currentTarget.value);
    setRelationPickerHoveredId('');
  };

  useEffect(() => {
    setRelationPickerSearchFilter('');
  }, [setRelationPickerSearchFilter]);

  return {
    searchFilter: relationPickerSearchFilter,
    handleSearchFilterChange,
  };
};

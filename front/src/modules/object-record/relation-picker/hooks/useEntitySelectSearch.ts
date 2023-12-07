import debounce from 'lodash.debounce';

import { RelationPickerRecoilScopeContext } from '@/object-record/relation-picker/states/recoil-scope-contexts/RelationPickerRecoilScopeContext';
import { relationPickerPreselectedIdScopedState } from '@/object-record/relation-picker/states/relationPickerPreselectedIdScopedState';
import { relationPickerSearchFilterScopedState } from '@/object-record/relation-picker/states/relationPickerSearchFilterScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export const useEntitySelectSearch = () => {
  const [, setRelationPickerPreselectedId] = useRecoilScopedState(
    relationPickerPreselectedIdScopedState,
    RelationPickerRecoilScopeContext,
  );

  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(
      relationPickerSearchFilterScopedState,
      RelationPickerRecoilScopeContext,
    );

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
    setRelationPickerPreselectedId('');
  };

  return {
    searchFilter: relationPickerSearchFilter,
    handleSearchFilterChange,
  };
};

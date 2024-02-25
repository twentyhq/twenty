import debounce from 'lodash.debounce';
import { useRecoilState } from 'recoil';

import { selectFieldSearchFilterScopedState } from '@/object-record/select/states/selectFieldSearchFilterScopedState';

export const useSelectFieldSearch = () => {
  const [selectFieldSearchFilter, setSelectFieldSearchFilter] = useRecoilState(
    selectFieldSearchFilterScopedState,
  );
  const debouncedSetSearchFilter = debounce(setSelectFieldSearchFilter, 100, {
    leading: true,
  });

  const handleSearchFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    debouncedSetSearchFilter(event.currentTarget.value);
  };

  return {
    searchFilter: selectFieldSearchFilter,
    handleSearchFilterChange,
  };
};

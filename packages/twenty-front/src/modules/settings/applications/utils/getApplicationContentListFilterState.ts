import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentFilter } from '@/settings/applications/utils/getApplicationContentFilters';

export const getApplicationContentListFilterState = ({
  filters,
  searchParams,
}: {
  filters: ApplicationContentFilter[];
  searchParams: URLSearchParams;
}) => {
  const activeFilters = filters.flatMap((filter) => {
    const selectedOption = filter.options.find(
      (option) => option.universalIdentifier === searchParams.get(filter.key),
    );

    return isDefined(selectedOption) ? [{ ...filter, selectedOption }] : [];
  });

  const selectableFilter = filters.find(
    (filter) => filter.isSelectable && filter.options.length > 0,
  );

  const matchesActiveFilters = (item: ApplicationContentItem) =>
    activeFilters.every(({ getItemKeys, selectedOption }) =>
      getItemKeys(item).includes(selectedOption.universalIdentifier),
    );

  return {
    activeFilters,
    selectableFilter,
    selectedSelectableValue: isDefined(selectableFilter)
      ? searchParams.get(selectableFilter.key)
      : null,
    matchesActiveFilters,
  };
};

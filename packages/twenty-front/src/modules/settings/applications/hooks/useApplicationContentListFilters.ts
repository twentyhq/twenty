import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useApplicationContentFilters } from '@/settings/applications/hooks/useApplicationContentFilters';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export const useApplicationContentListFilters = ({
  contentType,
  content,
}: {
  contentType: ApplicationContentType;
  content: ApplicationContent;
}) => {
  const filters = useApplicationContentFilters({ contentType, content });
  const [searchParams] = useSearchParams();

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

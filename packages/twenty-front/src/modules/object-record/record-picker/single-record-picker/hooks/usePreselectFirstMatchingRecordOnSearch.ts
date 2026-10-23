import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Once per search term, so arrowing back to the empty option is respected
export const usePreselectFirstMatchingRecordOnSearch = ({
  searchFilter,
  firstMatchingRecordId,
  preselect,
}: {
  searchFilter: string;
  firstMatchingRecordId: string | undefined;
  preselect: (recordId: string) => void;
}) => {
  const [
    searchFilterWithPreselectedMatch,
    setSearchFilterWithPreselectedMatch,
  ] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isNonEmptyString(searchFilter)) {
      setSearchFilterWithPreselectedMatch(undefined);
      return;
    }

    if (
      !isDefined(firstMatchingRecordId) ||
      searchFilterWithPreselectedMatch === searchFilter
    ) {
      return;
    }

    setSearchFilterWithPreselectedMatch(searchFilter);
    preselect(firstMatchingRecordId);
  }, [
    searchFilter,
    firstMatchingRecordId,
    preselect,
    searchFilterWithPreselectedMatch,
  ]);
};

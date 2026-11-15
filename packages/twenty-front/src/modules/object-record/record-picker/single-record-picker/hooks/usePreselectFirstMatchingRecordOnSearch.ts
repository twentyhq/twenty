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
  const [prevSearchFilter, setPrevSearchFilter] = useState(searchFilter);
  const [hasPreselected, setHasPreselected] = useState(false);

  if (searchFilter !== prevSearchFilter) {
    setPrevSearchFilter(searchFilter);
    setHasPreselected(false);
  }

  useEffect(() => {
    if (!isNonEmptyString(searchFilter) || !isDefined(firstMatchingRecordId)) {
      return;
    }

    if (hasPreselected) {
      return;
    }

    setHasPreselected(true);
    preselect(firstMatchingRecordId);
  }, [searchFilter, firstMatchingRecordId, hasPreselected, preselect]);
};

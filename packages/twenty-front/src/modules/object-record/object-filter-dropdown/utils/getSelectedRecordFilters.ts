import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

export const getSelectedRecordFilters = (
  selectedFilter: RecordFilter | null | undefined,
) => {
  try {
    if (!isDefined(selectedFilter) || !isDefined(selectedFilter.value)) {
      return [];
    }

    if (!isNonEmptyString(selectedFilter.value)) {
      return [];
    }

    const raw = JSON.parse(selectedFilter.value);
    const zodStringArrayOfNonEmptyString = z.array(z.string().min(1));
    return zodStringArrayOfNonEmptyString.parse(raw);
  } catch (error) {
    //eslint-disable-next-line no-console
    console.error(error);
    return [];
  }
};

import { COACHING_LIST_GQL_FIELDS } from '@/coaching/constants/CoachingListGqlFields.constants';
import { COACHING_LIST_PAGE_SIZE } from '@/coaching/constants/CoachingListPageSize.constants';
import { COACHING_OBJECT_NAME_SINGULAR } from '@/coaching/constants/CoachingObjectNameSingular.constants';
import { type CoachingFilterValues } from '@/coaching/types/coaching.types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

const buildCoachingFilter = (
  filterValues: CoachingFilterValues,
): RecordGqlOperationFilter | undefined => {
  if (!filterValues.searchTerm) {
    return undefined;
  }

  return {
    or: [
      { name: { ilike: `%${filterValues.searchTerm}%` } },
      { fullName: { ilike: `%${filterValues.searchTerm}%` } },
      { email: { ilike: `%${filterValues.searchTerm}%` } },
    ],
  };
};

export const useCoachingCustomersList = (
  filterValues: CoachingFilterValues,
) => {
  const filter = buildCoachingFilter(filterValues);

  const { records, loading, error, fetchMoreRecords, hasNextPage, totalCount } =
    useFindManyRecords({
      objectNameSingular: COACHING_OBJECT_NAME_SINGULAR,
      filter,
      orderBy: [{ name: 'AscNullsLast' }],
      recordGqlFields: COACHING_LIST_GQL_FIELDS,
      limit: COACHING_LIST_PAGE_SIZE,
    });

  return {
    customers: records,
    loading,
    error,
    fetchMoreRecords,
    hasNextPage,
    totalCount,
  };
};

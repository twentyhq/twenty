import { COAT_LIST_GQL_FIELDS } from '@/coat-approval/constants/CoatListGqlFields.constants';
import { COAT_LIST_PAGE_SIZE } from '@/coat-approval/constants/CoatListPageSize.constants';
import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import { type CoatFilterValues } from '@/coat-approval/types/coat-approval.types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

const buildCoatFilter = (
  filterValues: CoatFilterValues,
): RecordGqlOperationFilter | undefined => {
  const clauses: RecordGqlOperationFilter[] = [];

  if (filterValues.searchTerm) {
    clauses.push({
      or: [
        { name: { ilike: `%${filterValues.searchTerm}%` } },
        { customerName: { ilike: `%${filterValues.searchTerm}%` } },
        { customerEmail: { ilike: `%${filterValues.searchTerm}%` } },
        { contractId: { ilike: `%${filterValues.searchTerm}%` } },
      ],
    });
  }

  // TODO: Confirm the exact field name for export status on the tobContract object
  if (filterValues.exportStatus) {
    clauses.push({
      status: { eq: filterValues.exportStatus },
    });
  }

  if (filterValues.programName) {
    clauses.push({
      programName: { ilike: `%${filterValues.programName}%` },
    });
  }

  if (filterValues.dateFrom) {
    clauses.push({
      signatureDate: { gte: filterValues.dateFrom },
    });
  }

  if (filterValues.dateTo) {
    clauses.push({
      signatureDate: { lte: filterValues.dateTo },
    });
  }

  if (clauses.length === 0) {
    return undefined;
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return { and: clauses };
};

export const useCoatContractsList = (filterValues: CoatFilterValues) => {
  const filter = buildCoatFilter(filterValues);

  const { records, loading, error, fetchMoreRecords, hasNextPage, totalCount } =
    useFindManyRecords({
      objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
      filter,
      orderBy: [{ signatureDate: 'DescNullsLast' }],
      recordGqlFields: COAT_LIST_GQL_FIELDS,
      limit: COAT_LIST_PAGE_SIZE,
    });

  return {
    contracts: records,
    loading,
    error,
    fetchMoreRecords,
    hasNextPage,
    totalCount,
  };
};

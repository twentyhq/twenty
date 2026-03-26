import { COAT_LIST_GQL_FIELDS } from '@/coat-approval/constants/CoatListGqlFields.constants';
import { COAT_LIST_PAGE_SIZE } from '@/coat-approval/constants/CoatListPageSize.constants';
import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import {
  type CoatFilterValues,
  type CoatTab,
} from '@/coat-approval/types/coat-approval.types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

const buildTabFilter = (activeTab: CoatTab): RecordGqlOperationFilter[] => {
  const clauses: RecordGqlOperationFilter[] = [];

  switch (activeTab) {
    case 'analyze':
      // Only completed contracts that haven't been exported yet
      clauses.push({ status: { eq: 'Completed' } });
      clauses.push({
        or: [
          { coatExportStatus: { is: 'NULL' } },
          { coatExportStatus: { eq: 'NEEDS_APPROVAL' } },
        ],
      });
      break;

    case 'all':
      // No tab-level filter -- show everything
      break;

    case 'warnings':
      // Only completed contracts with special agreements
      clauses.push({ status: { eq: 'Completed' } });
      clauses.push({
        and: [
          { specialAgreements: { is: 'NOT_NULL' } },
          { specialAgreements: { neq: '' } },
          { specialAgreements: { neq: '.' } },
        ],
      });
      break;
  }

  return clauses;
};

const getTabOrderBy = (activeTab: CoatTab) => {
  switch (activeTab) {
    case 'analyze':
    case 'warnings':
      return [{ createdAt: 'AscNullsLast' as const }];
    case 'all':
      return [{ createdAt: 'DescNullsLast' as const }];
  }
};

const buildCoatFilter = (
  filterValues: CoatFilterValues,
  activeTab: CoatTab,
): RecordGqlOperationFilter | undefined => {
  const clauses: RecordGqlOperationFilter[] = [];

  // Tab-level filters
  clauses.push(...buildTabFilter(activeTab));

  if (filterValues.searchTerm.length > 0) {
    clauses.push({
      or: [
        { name: { ilike: `%${filterValues.searchTerm}%` } },
        { customerFirstName: { ilike: `%${filterValues.searchTerm}%` } },
        { customerLastName: { ilike: `%${filterValues.searchTerm}%` } },
        { customerEmail: { ilike: `%${filterValues.searchTerm}%` } },
        { contractId: { ilike: `%${filterValues.searchTerm}%` } },
      ],
    });
  }

  if (filterValues.exportStatus.length > 0) {
    clauses.push({
      coatExportStatus: { eq: filterValues.exportStatus },
    });
  }

  if (filterValues.programName.length > 0) {
    clauses.push({
      program: { ilike: `%${filterValues.programName}%` },
    });
  }

  if (filterValues.dateFrom.length > 0) {
    clauses.push({
      startDate: { gte: filterValues.dateFrom },
    });
  }

  if (filterValues.dateTo.length > 0) {
    clauses.push({
      startDate: { lte: filterValues.dateTo },
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

export const useCoatContractsList = (
  filterValues: CoatFilterValues,
  activeTab: CoatTab,
) => {
  const filter = buildCoatFilter(filterValues, activeTab);

  const orderBy = getTabOrderBy(activeTab);

  const { records, loading, error, fetchMoreRecords, hasNextPage, totalCount } =
    useFindManyRecords({
      objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
      filter,
      orderBy,
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

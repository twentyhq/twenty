import { COAT_LIST_GQL_FIELDS } from '@/coat-approval/constants/CoatListGqlFields.constants';
import { COAT_LIST_PAGE_SIZE } from '@/coat-approval/constants/CoatListPageSize.constants';
import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import {
  type CoatFilterValues,
  type CoatTab,
} from '@/coat-approval/types/coat-approval.types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

const buildTabFilter = (
  activeTab: CoatTab,
): RecordGqlOperationFilter[] => {
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
      // Contracts with special agreements (non-empty) or payment issues
      clauses.push({
        or: [
          {
            and: [
              { specialAgreements: { is: 'NOT_NULL' } },
              // Filter out entries that are just a period
              { specialAgreements: { neq: '' } },
              { specialAgreements: { neq: '.' } },
            ],
          },
        ],
      });
      break;
  }

  return clauses;
};

const buildCoatFilter = (
  filterValues: CoatFilterValues,
  activeTab: CoatTab,
): RecordGqlOperationFilter | undefined => {
  const clauses: RecordGqlOperationFilter[] = [];

  // Tab-level filters
  clauses.push(...buildTabFilter(activeTab));

  if (filterValues.searchTerm) {
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

  if (filterValues.exportStatus) {
    clauses.push({
      coatExportStatus: { eq: filterValues.exportStatus },
    });
  }

  if (filterValues.programName) {
    clauses.push({
      program: { ilike: `%${filterValues.programName}%` },
    });
  }

  if (filterValues.dateFrom) {
    clauses.push({
      startDate: { gte: filterValues.dateFrom },
    });
  }

  if (filterValues.dateTo) {
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

  const { records, loading, error, fetchMoreRecords, hasNextPage, totalCount } =
    useFindManyRecords({
      objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
      filter,
      orderBy: [{ createdAt: 'DescNullsLast' }],
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

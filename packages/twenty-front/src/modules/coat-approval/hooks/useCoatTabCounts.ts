import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import { type CoatFilterValues } from '@/coat-approval/types/coat-approval.types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

const buildCountFilter = (
  tab: 'analyze' | 'all' | 'warnings',
  filterValues: CoatFilterValues,
): RecordGqlOperationFilter | undefined => {
  const clauses: RecordGqlOperationFilter[] = [];

  switch (tab) {
    case 'analyze':
      clauses.push({ status: { eq: 'Completed' } });
      clauses.push({
        or: [
          { coatExportStatus: { is: 'NULL' } },
          { coatExportStatus: { eq: 'NEEDS_APPROVAL' } },
        ],
      });
      break;
    case 'all':
      break;
    case 'warnings':
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

  // Apply user-level filters (search, program, dates)
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

  if (filterValues.programName) {
    clauses.push({
      program: { ilike: `%${filterValues.programName}%` },
    });
  }

  if (filterValues.dateFrom) {
    clauses.push({ startDate: { gte: filterValues.dateFrom } });
  }

  if (filterValues.dateTo) {
    clauses.push({ startDate: { lte: filterValues.dateTo } });
  }

  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { and: clauses };
};

export type CoatTabCounts = {
  analyze: number | undefined;
  all: number | undefined;
  warnings: number | undefined;
};

export const useCoatTabCounts = (
  filterValues: CoatFilterValues,
): CoatTabCounts => {
  const analyzeFilter = buildCountFilter('analyze', filterValues);
  const allFilter = buildCountFilter('all', filterValues);
  const warningsFilter = buildCountFilter('warnings', filterValues);

  const { totalCount: analyzeCount } = useFindManyRecords({
    objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
    filter: analyzeFilter,
    limit: 1,
    recordGqlFields: { id: true },
  });

  const { totalCount: allCount } = useFindManyRecords({
    objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
    filter: allFilter,
    limit: 1,
    recordGqlFields: { id: true },
  });

  const { totalCount: warningsCount } = useFindManyRecords({
    objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
    filter: warningsFilter,
    limit: 1,
    recordGqlFields: { id: true },
  });

  return {
    analyze: analyzeCount,
    all: allCount,
    warnings: warningsCount,
  };
};

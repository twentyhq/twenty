import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { signInBackgroundMockCompanies } from '@/sign-in-background-mock/constants/signInBackgroundMockCompanies';

import { useFindManyRecords } from '../../hooks/useFindManyRecords';

export const useLoadRecordIndexTable = (objectNameSingular: string) => {
  const { setRecordTableData, setIsRecordTableInitialLoading } =
    useRecordTable();

  const onboardingStatus = useOnboardingStatus();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const {
    getTableFiltersState,
    getTableSortsState,
    getTableLastRowVisibleState,
  } = useRecordTableStates();

  const tableFilters = useRecoilValue(getTableFiltersState());
  const tableSorts = useRecoilValue(getTableSortsState());
  const setLastRowVisible = useSetRecoilState(getTableLastRowVisibleState());

  const requestFilters = turnObjectDropdownFilterIntoQueryFilter(
    tableFilters,
    objectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderBy(
    tableSorts,
    objectMetadataItem?.fields ?? [],
  );

  const { records, loading, fetchMoreRecords, queryStateIdentifier } =
    useFindManyRecords({
      objectNameSingular,
      filter: requestFilters,
      orderBy,
      onCompleted: () => {
        setLastRowVisible(false);
        setIsRecordTableInitialLoading(false);
      },
    });

  return {
    records:
      onboardingStatus === OnboardingStatus.Completed
        ? records
        : signInBackgroundMockCompanies,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
    setRecordTableData,
  };
};

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState.ts';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { SIGN_IN_BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/SignInBackgroundMockCompanies';

import { useFindManyRecords } from '../../hooks/useFindManyRecords';

export const useFindManyParams = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { getTableFiltersState, getTableSortsState } = useRecordTableStates();

  const tableFilters = useRecoilValue(getTableFiltersState());
  const tableSorts = useRecoilValue(getTableSortsState());

  const filter = turnObjectDropdownFilterIntoQueryFilter(
    tableFilters,
    objectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderBy(
    tableSorts,
    objectMetadataItem?.fields ?? [],
  );

  return { objectNameSingular, filter, orderBy };
};

export const useLoadRecordIndexTable = (objectNameSingular: string) => {
  const { setRecordTableData, setIsRecordTableInitialLoading } =
    useRecordTable();
  const { getTableLastRowVisibleState } = useRecordTableStates();
  const setLastRowVisible = useSetRecoilState(getTableLastRowVisibleState());
  const currentWorkspace = useRecoilValue(currentWorkspaceState());
  const params = useFindManyParams(objectNameSingular);

  const {
    records,
    loading,
    totalCount,
    fetchMoreRecords,
    queryStateIdentifier,
  } = useFindManyRecords({
    ...params,
    onCompleted: () => {
      setLastRowVisible(false);
      setIsRecordTableInitialLoading(false);
    },
  });

  return {
    records:
      currentWorkspace?.activationStatus === 'active'
        ? records
        : SIGN_IN_BACKGROUND_MOCK_COMPANIES,
    totalCount: totalCount || 0,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
    setRecordTableData,
  };
};

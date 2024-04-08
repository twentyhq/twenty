import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState.ts';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { useRecordTableQueryFields } from '@/object-record/record-index/hooks/useRecordTableQueryFields';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { SIGN_IN_BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/SignInBackgroundMockCompanies';

export const useFindManyParams = (
  objectNameSingular: string,
  recordTableId?: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const { tableFiltersState, tableSortsState } =
    useRecordTableStates(recordTableId);

  const tableFilters = useRecoilValue(tableFiltersState);
  const tableSorts = useRecoilValue(tableSortsState);

  const filter = turnObjectDropdownFilterIntoQueryFilter(
    tableFilters,
    objectMetadataItem?.fields ?? [],
  );

  if (objectMetadataItem?.isRemote) {
    return { objectNameSingular, filter };
  }

  const orderBy = turnSortsIntoOrderBy(
    tableSorts,
    objectMetadataItem?.fields ?? [],
  );

  return { objectNameSingular, filter, orderBy };
};

export const useLoadRecordIndexTable = (objectNameSingular: string) => {
  const { setRecordTableData, setIsRecordTableInitialLoading } =
    useRecordTable();
  const { tableLastRowVisibleState } = useRecordTableStates();
  const setLastRowVisible = useSetRecoilState(tableLastRowVisibleState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const params = useFindManyParams(objectNameSingular);

  const queryFields = useRecordTableQueryFields();

  const {
    records,
    loading,
    totalCount,
    fetchMoreRecords,
    queryStateIdentifier,
  } = useFindManyRecords({
    ...params,
    queryFields,
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

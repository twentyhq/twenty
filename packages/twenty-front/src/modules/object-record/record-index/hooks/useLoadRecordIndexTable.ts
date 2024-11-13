import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { useRecordTableRecordGqlFields } from '@/object-record/record-index/hooks/useRecordTableRecordGqlFields';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { tableFiltersComponentState } from '@/object-record/record-table/states/tableFiltersComponentState';
import { tableSortsComponentState } from '@/object-record/record-table/states/tableSortsComponentState';
import { tableViewFilterGroupsComponentState } from '@/object-record/record-table/states/tableViewFilterGroupsComponentState';
import { SIGN_IN_BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/SignInBackgroundMockCompanies';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNull } from '@sniptt/guards';
import { useMemo } from 'react';
import { isDefined } from 'twenty-ui';
import { WorkspaceActivationStatus } from '~/generated/graphql';

export const useFindManyParams = (
  objectNameSingular: string,
  recordTableId?: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const currentRecordGroupDefinition =
    useCurrentRecordGroupDefinition(recordTableId);

  const tableViewFilterGroups = useRecoilComponentValueV2(
    tableViewFilterGroupsComponentState,
    recordTableId,
  );
  const tableFilters = useRecoilComponentValueV2(
    tableFiltersComponentState,
    recordTableId,
  );
  const tableSorts = useRecoilComponentValueV2(
    tableSortsComponentState,
    recordTableId,
  );

  const stateFilter = computeViewRecordGqlOperationFilter(
    tableFilters,
    objectMetadataItem?.fields ?? [],
    tableViewFilterGroups,
  );

  const recordGroupFilter = useMemo(() => {
    if (isDefined(currentRecordGroupDefinition)) {
      const fieldMetadataItem = objectMetadataItem?.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === currentRecordGroupDefinition.fieldMetadataId,
      );

      if (!fieldMetadataItem) {
        return {};
      }

      return {
        [fieldMetadataItem.name]: {
          eq: currentRecordGroupDefinition.value,
        },
      };
    }

    // TODO: Handle case when value is nullable

    return {};
  }, [objectMetadataItem.fields, currentRecordGroupDefinition]);

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, tableSorts);

  return {
    objectNameSingular,
    filter: {
      ...stateFilter,
      ...recordGroupFilter,
    },
    orderBy,
  };
};

export const useLoadRecordIndexTable = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { setRecordTableData, setIsRecordTableInitialLoading } =
    useRecordTable();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const params = useFindManyParams(objectNameSingular);

  const recordGqlFields = useRecordTableRecordGqlFields({ objectMetadataItem });

  const {
    records,
    loading,
    totalCount,
    fetchMoreRecords,
    queryStateIdentifier,
    hasNextPage,
  } = useFindManyRecords({
    ...params,
    recordGqlFields,
    onCompleted: () => {
      setIsRecordTableInitialLoading(false);
    },
    onError: () => {
      setIsRecordTableInitialLoading(false);
    },
    skip: isNull(currentWorkspaceMember),
  });

  return {
    records:
      currentWorkspace?.activationStatus === WorkspaceActivationStatus.Active
        ? records
        : SIGN_IN_BACKGROUND_MOCK_COMPANIES,
    totalCount: totalCount,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
    setRecordTableData,
    hasNextPage,
  };
};

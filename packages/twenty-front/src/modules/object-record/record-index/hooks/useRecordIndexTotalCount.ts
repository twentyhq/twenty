import { useEffect } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordIndexEntityCountNoGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexEntityCountNoGroupComponentFamilyState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useRecoilCallback } from 'recoil';

export const useUpdateRecordIndexTotalCount = ({
  objectNameSingular,
  recordIndexId,
}: {
  objectNameSingular: string;
  recordIndexId: string;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ViewComponentInstanceContext,
    recordIndexId,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
    instanceId,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const filter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const setEntityCount = useRecoilCallback(
    ({ set }) =>
      (count: number) => {
        set(
          recordIndexEntityCountNoGroupComponentFamilyState.atomFamily({
            instanceId: instanceId,
          }),
          count,
        );
      },
    [instanceId],
  );

  const { data, loading } = useAggregateRecords({
    objectNameSingular,
    filter,
    recordGqlFieldsAggregate: {
      id: [AGGREGATE_OPERATIONS.count],
    },
  });

  const totalCount = data?.id?.COUNT as number | undefined;

  useEffect(() => {
    if (totalCount !== undefined) {
      setEntityCount(totalCount);
    }
  }, [totalCount, setEntityCount]);

  return {
    totalCount,
    loading,
  };
};

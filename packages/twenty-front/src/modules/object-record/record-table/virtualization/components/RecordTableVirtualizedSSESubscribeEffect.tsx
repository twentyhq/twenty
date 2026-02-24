import { useMemo } from 'react';

import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { computeRecordGqlOperationFilter } from 'twenty-shared/utils';

export const RecordTableVirtualizedSSESubscribeEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { filterValueDependencies } = useFilterValueDependencies();

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const queryId = `record-table-virtualized-${objectMetadataItem.nameSingular}`;

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: computeRecordGqlOperationFilter({
          fields: objectMetadataItem.fields,
          recordFilters: currentRecordFilters,
          recordFilterGroups: currentRecordFilterGroups,
          filterValueDependencies,
        }),
        orderBy: turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts),
      },
    }),
    [
      objectMetadataItem,
      currentRecordFilters,
      currentRecordFilterGroups,
      filterValueDependencies,
      currentRecordSorts,
    ],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature,
  });

  return null;
};

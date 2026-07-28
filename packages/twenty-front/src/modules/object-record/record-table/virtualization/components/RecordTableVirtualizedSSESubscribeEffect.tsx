import { useCallback, useMemo } from 'react';

import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { computeRecordGqlOperationFilter } from 'twenty-shared/utils';

export const RecordTableVirtualizedSSESubscribeEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { filterValueDependencies } = useFilterValueDependencies();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();

  const reloadTable = useCallback(async () => {
    await Promise.all([
      resetVirtualizationBecauseDataChanged(),
      refetchAggregateQueriesForObjectMetadataItem({ objectMetadataItem }),
    ]);
  }, [
    objectMetadataItem,
    refetchAggregateQueriesForObjectMetadataItem,
    resetVirtualizationBecauseDataChanged,
  ]);

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const queryId = `record-table-virtualized-${objectMetadataItem.nameSingular}`;

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: computeRecordGqlOperationFilter({
          fieldMetadataItems: flattenedFieldMetadataItems,
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
      flattenedFieldMetadataItems,
    ],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature,
    onSseReconnected: reloadTable,
  });

  return null;
};

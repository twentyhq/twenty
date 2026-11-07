import { useCallback, useMemo } from 'react';

import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexAdditionalFilter } from '@/object-record/record-index/hooks/useRecordIndexAdditionalFilter';
import { useRecordIndexQueryRecordFilters } from '@/object-record/record-index/hooks/useRecordIndexQueryRecordFilters';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
} from 'twenty-shared/utils';

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

  const {
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
  } = useRecordIndexQueryRecordFilters();

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );

  const additionalFilter = useRecordIndexAdditionalFilter();

  const queryId = `record-table-virtualized-${objectMetadataItem.nameSingular}`;

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: combineFilters([
          computeRecordGqlOperationFilter({
            fieldMetadataItems: flattenedFieldMetadataItems,
            recordFilters: currentRecordFilters,
            recordFilterGroups: currentRecordFilterGroups,
            filterValueDependencies,
          }),
          additionalFilter,
        ]),
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
      additionalFilter,
    ],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature,
    onSseReconnected: reloadTable,
  });

  return null;
};

import { useMemo } from 'react';

import { fieldMetadataItemByIdMapSelector } from '@/object-metadata/states/fieldMetadataItemByIdMapSelector';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { computeRecordGqlOperationFilter } from 'twenty-shared/utils';

export const RecordTableVirtualizedSSESubscribeEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { filterValueDependencies } = useFilterValueDependencies();

  const fieldMetadataItemByIdMap = useAtomStateValue(
    fieldMetadataItemByIdMapSelector,
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
          findFieldMetadataItemById: (id) => fieldMetadataItemByIdMap.get(id),
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
      fieldMetadataItemByIdMap,
    ],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature,
  });

  return null;
};

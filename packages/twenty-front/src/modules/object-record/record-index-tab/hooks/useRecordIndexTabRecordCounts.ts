import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RECORD_INDEX_NO_VALUE_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexNoValueTabId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue } from '@/object-record/record-index/utils/turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetRecordGroupVisibilityFilters } from '@/views/hooks/useGetRecordGroupVisibilityFilters';
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

const COUNT_GQL_FIELD = 'totalCount';

// Counts every tab under the view's filters, so they do not move with the active tab
export const useRecordIndexTabRecordCounts = (
  recordIndexTabFieldMetadataItem: FieldMetadataItem,
) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const apolloCoreClient = useApolloCoreClient();

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  // Hidden groups are left out of the view's total, so the tabs leave them out too
  const { recordFilters: recordGroupVisibilityFilters, recordGroupGqlFilter } =
    useGetRecordGroupVisibilityFilters();

  const viewFilter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: [...currentRecordFilters, ...recordGroupVisibilityFilters],
    recordFilterGroups: currentRecordFilterGroups,
    fieldMetadataItems: flattenedFieldMetadataItems,
  });

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.readableFields,
      filterValue: anyFieldFilterValue,
    });

  const groupByAggregateQuery = useMemo(
    () =>
      generateGroupByAggregateQuery({
        aggregateOperationGqlFields: [COUNT_GQL_FIELD],
        objectMetadataItem,
      }),
    [objectMetadataItem],
  );

  const optionCount = recordIndexTabFieldMetadataItem.options?.length ?? 0;

  const { data } = useQuery(groupByAggregateQuery, {
    variables: {
      filter: combineFilters([
        anyFieldFilter,
        viewFilter,
        recordGroupGqlFilter ?? {},
      ]),
      groupBy: buildGroupByFieldObject({
        field: recordIndexTabFieldMetadataItem,
      }),
      // One extra group for records without a value
      limit: optionCount + 1,
    },
    client: apolloCoreClient,
  });

  const recordCountByRecordIndexTabId = useMemo(() => {
    if (!isDefined(data)) {
      return undefined;
    }

    const { recordAggregateValueByGroupValueArray } =
      turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
        {
          objectMetadataItem,
          queryResult: data,
          recordAggregateGqlField: COUNT_GQL_FIELD,
        },
      );

    return Object.fromEntries(
      recordAggregateValueByGroupValueArray.map(
        ({ recordGroupValue, recordAggregateValue }) => [
          recordGroupValue ?? RECORD_INDEX_NO_VALUE_TAB_ID,
          Number(recordAggregateValue ?? 0),
        ],
      ),
    ) as Record<string, number>;
  }, [data, objectMetadataItem]);

  return { recordCountByRecordIndexTabId };
};

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { RECORD_BOARD_RELATION_GROUPS_COUNT_LIMIT } from '@/object-record/record-board/constants/RecordBoardRelationGroupsCountLimit';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

type GroupByCountQueryResult = Record<string, unknown[] | undefined>;

export const useRecordBoardRelationGroupsTotalCount = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const apolloCoreClient = useApolloCoreClient();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const isRelationGrouping =
    isDefined(recordIndexGroupFieldMetadataItem) &&
    isManyToOneRelationField(recordIndexGroupFieldMetadataItem);

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fieldMetadataItems: flattenedFieldMetadataItems,
  });

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const countQuery: TypedDocumentNode<GroupByCountQueryResult> =
    generateGroupByAggregateQuery({
      aggregateOperationGqlFields: ['totalCount'],
      objectMetadataItem,
    });

  const groupByGqlInput = isRelationGrouping
    ? buildGroupByFieldObject({ field: recordIndexGroupFieldMetadataItem })
    : {};

  const queryFieldName = getGroupByQueryResultGqlFieldName(objectMetadataItem);

  const { data, loading } = useQuery(countQuery, {
    skip: !isRelationGrouping || !hasReadPermission,
    variables: {
      filter: { ...requestFilters, ...anyFieldFilter },
      groupBy: { ...groupByGqlInput },
      limit: RECORD_BOARD_RELATION_GROUPS_COUNT_LIMIT,
    },
    client: apolloCoreClient,
  });

  const totalRelationGroupsCount: number = isRelationGrouping
    ? (data?.[queryFieldName]?.length ?? 0)
    : 0;

  return {
    isRelationGrouping,
    totalRelationGroupsCount,
    loading,
  };
};

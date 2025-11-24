import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAggregateGqlFieldsFromRecordIndexGroupAggregates } from '@/object-record/record-index/hooks/useAggregateGqlFieldsFromRecordIndexGroupAggregates';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useQuery } from '@apollo/client';
import { type Nullable } from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const useRecordIndexGroupsAggregatesGroupBy = ({
  objectMetadataItem,
  skip,
  groupByFieldMetadataItem,
  recordIndexGroupAggregateFieldMetadataItem,
  recordIndexGroupAggregateOperation,
}: {
  skip?: boolean;
  objectMetadataItem: ObjectMetadataItem;
  groupByFieldMetadataItem: FieldMetadataItem;
  recordIndexGroupAggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  recordIndexGroupAggregateOperation: ExtendedAggregateOperations;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const { recordAggregateGqlField } =
    useAggregateGqlFieldsFromRecordIndexGroupAggregates({
      objectMetadataItem,
      recordIndexGroupAggregateFieldMetadataItem:
        recordIndexGroupAggregateFieldMetadataItem,
      recordIndexGroupAggregateOperation,
    });

  const groupByAggregateQuery = isDefined(recordAggregateGqlField)
    ? generateGroupByAggregateQuery({
        aggregateOperationGqlFields: [recordAggregateGqlField],
        objectMetadataItem,
      })
    : EMPTY_QUERY;

  const anyFieldFilterValue = useRecoilComponentValue(
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

  const groupByGqlInput = buildGroupByFieldObject({
    field: groupByFieldMetadataItem,
  });

  const { data, loading, error } = useQuery(groupByAggregateQuery, {
    skip:
      !isDefined(objectMetadataItem) ||
      !hasReadPermission ||
      skip ||
      !isDefined(recordAggregateGqlField),
    variables: {
      filter: { ...requestFilters, ...anyFieldFilter },
      groupBy: {
        ...groupByGqlInput,
      },
    },
    client: apolloCoreClient,
  });

  return {
    data,
    loading,
    error,
  };
};

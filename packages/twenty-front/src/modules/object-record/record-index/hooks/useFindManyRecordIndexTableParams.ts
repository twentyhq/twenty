import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { useRecordIndexAdditionalFilter } from '@/object-record/record-index/hooks/useRecordIndexAdditionalFilter';
import { useRecordIndexQueryRecordFilters } from '@/object-record/record-index/hooks/useRecordIndexQueryRecordFilters';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const useFindManyRecordIndexTableParams = (
  objectNameSingular: string,
  instanceId?: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const { recordGroupFilter } = useRecordGroupFilter(
    objectMetadataItem?.fields,
  );

  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();

  const {
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
  } = useRecordIndexQueryRecordFilters(instanceId);

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
    instanceId,
  );

  const recordIndexGroupLoadLimit = useAtomComponentStateValue(
    recordIndexGroupLoadLimitComponentState,
    instanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const currentFilters = computeRecordGqlOperationFilter({
    fieldMetadataItems: flattenedFieldMetadataItems,
    recordFilterGroups: currentRecordFilterGroups,
    recordFilters: currentRecordFilters,
    filterValueDependencies,
  });

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    instanceId,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem?.readableFields ?? [],
      filterValue: anyFieldFilterValue,
    });

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    currentRecordSorts,
    objectMetadataItems,
  );

  const additionalFilter = useRecordIndexAdditionalFilter();

  const combinedFilter = combineFilters([
    currentFilters,
    recordGroupFilter,
    anyFieldFilter,
    additionalFilter,
  ]);

  return {
    objectNameSingular,
    filter: combinedFilter,
    orderBy,
    // Omitting limit lets ungrouped views fall through to QUERY_DEFAULT_LIMIT_RECORDS
    ...(isDefined(currentRecordGroupDefinition)
      ? { limit: recordIndexGroupLoadLimit }
      : {}),
  };
};

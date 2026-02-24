import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const useRecordIndexGroupCommonQueryVariables = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const anyFieldFilterValue = useRecoilComponentValueV2(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    currentRecordSorts,
    objectMetadataItems,
  );

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
    additionalFieldMetadataId: recordGroupFieldMetadata?.id,
  });

  const recordGroupDefinitions = useRecoilComponentSelectorValueV2(
    recordGroupDefinitionsComponentSelector,
  );

  const visibleRecordGroupDefinitions = recordGroupDefinitions.filter(
    (recordGroupDefinition) => recordGroupDefinition.isVisible,
  );

  const recordGroupValues = visibleRecordGroupDefinitions.map(
    (recordGroupDefinition) => recordGroupDefinition.value,
  );

  const recordGroupOptionsFilter = computeRecordGroupOptionsFilter({
    recordGroupFieldMetadata,
    recordGroupValues,
  });

  const combinedFilters = combineFilters([
    anyFieldFilter,
    requestFilters,
    recordGroupOptionsFilter,
  ]);

  const recordGroupsLimit = visibleRecordGroupDefinitions.length;

  return {
    combinedFilters,
    recordGqlFields,
    orderBy,
    recordGroupsLimit,
  };
};

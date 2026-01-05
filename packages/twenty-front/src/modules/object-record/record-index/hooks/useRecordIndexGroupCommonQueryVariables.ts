import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const useRecordIndexGroupCommonQueryVariables = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts);

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
    additionalFieldMetadataId: recordGroupFieldMetadata?.id,
  });

  const recordGroupDefinitions = useRecoilComponentValue(
    recordGroupDefinitionsComponentSelector,
  );

  const visibleRecordGroupDefinitions = recordGroupDefinitions.filter(
    (recordGroupDefinition) => recordGroupDefinition.isVisible,
  );

  const recordGroupValues = visibleRecordGroupDefinitions.map(
    (recordGroupDefinition) => recordGroupDefinition.value,
  );

  const recordGroupOptionsFilter = isDefined(recordGroupFieldMetadata)
    ? {
        [recordGroupFieldMetadata.name]: {
          in: recordGroupValues,
        },
      }
    : {};

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

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { buildRecordGqlFieldsAggregateForView } from '@/object-record/record-board/record-board-column/utils/buildRecordGqlFieldsAggregateForView';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeRecordGqlOperationFilter';
import { turnAnyFieldFilterIntoRecordGqlFilter } from '@/object-record/record-filter/utils/turnAnyFieldFilterIntoRecordGqlFilter';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

type UseAggregateRecordsProps = {
  objectMetadataItem: ObjectMetadataItem;
  additionalFilters?: Record<string, unknown>;
  fallbackFieldName: string;
};

export const useAggregateRecordsForHeader = ({
  objectMetadataItem,
  additionalFilters = {},
}: UseAggregateRecordsProps) => {
  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const recordIndexKanbanAggregateOperation = useRecoilValue(
    recordIndexKanbanAggregateOperationState,
  );

  const dateLocale = useRecoilValue(dateLocaleState);

  const { filterValueDependencies } = useFilterValueDependencies();

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const recordGqlFieldsAggregate = buildRecordGqlFieldsAggregateForView({
    objectMetadataItem,
    recordIndexKanbanAggregateOperation,
  });

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      objectMetadataItem,
      filterValue: anyFieldFilterValue,
    });

  const { data } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: { ...requestFilters, ...additionalFilters, ...anyFieldFilter },
  });

  const { value, labelWithFieldName } = computeAggregateValueAndLabel({
    data,
    objectMetadataItem,
    fieldMetadataId: recordIndexKanbanAggregateOperation?.fieldMetadataId,
    aggregateOperation: recordIndexKanbanAggregateOperation?.operation,
    dateFormat,
    timeFormat,
    timeZone,
    localeCatalog: dateLocale.localeCatalog,
  });

  return {
    aggregateValue: value,
    aggregateLabel: isDefined(value) ? labelWithFieldName : undefined,
  };
};

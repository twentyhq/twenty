import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

export const useRecordIndexExportParameters = ({
  objectMetadataItem,
  recordIndexId,
  viewType = ViewType.TABLE,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
  viewType?: ViewType;
}) => {
  const { hiddenBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
    recordIndexId,
  );

  const hiddenKanbanFieldColumn = hiddenBoardFields.find(
    (column) =>
      column.metadata.fieldName === recordIndexGroupFieldMetadataItem?.name,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
  );

  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
  );

  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const findManyRecordsParams = useFindManyRecordIndexTableParams(
    objectMetadataItem.nameSingular,
    recordIndexId,
  );

  const isEmptySelection =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 0;

  const contextStoreFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    fieldMetadataItems: flattenedFieldMetadataItems,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const queryFilter = isEmptySelection
    ? findManyRecordsParams.filter
    : contextStoreFilter;

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const finalColumns: Pick<
    ColumnDefinition<FieldMetadata>,
    'label' | 'type' | 'metadata'
  >[] = [
    ...visibleRecordFields
      .map((field: RecordField) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === field.fieldMetadataItemId,
        );

        if (!isDefined(fieldMetadataItem)) {
          return null;
        }

        return {
          label: fieldMetadataItem.label,
          type: fieldMetadataItem.type,
          metadata: {
            fieldName: fieldMetadataItem.name,
            relationType: fieldMetadataItem.relation?.type,
          },
        };
      })
      .filter(isDefined),
    ...(hiddenKanbanFieldColumn && viewType === ViewType.KANBAN
      ? [hiddenKanbanFieldColumn]
      : []),
  ];

  return {
    objectMetadataId: objectMetadataItem.id,
    filter: queryFilter,
    orderBy: findManyRecordsParams.orderBy,
    fieldMetadataIds: finalColumns
      .map(
        (column) =>
          objectMetadataItem.fields.find(
            (field) => field.name === column.metadata.fieldName,
          )?.id,
      )
      .filter(isDefined),
  };
};

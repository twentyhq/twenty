import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type RecordIndexExportColumn } from '@/object-record/record-index/export/types/RecordIndexExportColumn';
import { buildRecordIndexExportColumnsFromRecordFields } from '@/object-record/record-index/export/utils/buildRecordIndexExportColumnsFromRecordFields';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
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

  const { objectMetadataItems } = useObjectMetadataItems();

  const finalColumns: RecordIndexExportColumn[] = [
    ...buildRecordIndexExportColumnsFromRecordFields({
      recordFields: visibleRecordFields,
      objectMetadataItem,
      objectMetadataItems,
    }),
    ...(hiddenKanbanFieldColumn && viewType === ViewType.KANBAN
      ? [hiddenKanbanFieldColumn]
      : []),
  ];

  return {
    objectMetadataId: objectMetadataItem.id,
    filter: queryFilter,
    orderBy: findManyRecordsParams.orderBy,
    fieldMetadataIds: finalColumns
      .filter((column) => !isDefined(column.relationTraversal))
      .map(
        (column) =>
          objectMetadataItem.fields.find(
            (field) => field.name === column.metadata.fieldName,
          )?.id,
      )
      .filter(isDefined),
    traversedFields: visibleRecordFields.flatMap((recordField) =>
      isDefined(recordField.relationTargetFieldMetadataItemId)
        ? [
            {
              fieldMetadataId: recordField.fieldMetadataItemId,
              relationTargetFieldMetadataId:
                recordField.relationTargetFieldMetadataItemId,
            },
          ]
        : [],
    ),
  };
};

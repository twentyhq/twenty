import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { View } from '@/views/types/View';
import { ViewField } from '@/views/types/ViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadRecordIndexStates = () => {
  const setContextStoreTargetedRecordsRuleComponentState =
    useSetRecoilComponentState(contextStoreTargetedRecordsRuleComponentState);

  const setRecordIndexIsCompactModeActive = useSetRecoilState(
    recordIndexIsCompactModeActiveState,
  );
  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);
  const setRecordIndexOpenRecordIn = useSetRecoilState(
    recordIndexOpenRecordInState,
  );
  const setRecordIndexViewKanbanFieldMetadataIdState = useSetRecoilState(
    recordIndexKanbanFieldMetadataIdState,
  );
  const setRecordIndexViewKanbanAggregateOperationState = useSetRecoilState(
    recordIndexKanbanAggregateOperationState,
  );
  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const { setTableColumns } = useSetTableColumns();

  const onViewFieldsChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        viewFields: ViewField[],
        objectMetadataItem: ObjectMetadataItem,
        recordIndexId: string,
      ) => {
        const activeFieldMetadataItems = objectMetadataItem.fields.filter(
          ({ isActive, isSystem }) => isActive && !isSystem,
        );

        const filterableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForFilterFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

        const sortableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForSortFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

        const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
          activeFieldMetadataItems
            .map((field, index) =>
              formatFieldMetadataItemAsColumnDefinition({
                position: index,
                field,
                objectMetadataItem,
              }),
            )
            .filter(filterAvailableTableColumns)
            .map((column) => {
              const existsInFilterDefinitions =
                filterableFieldMetadataItems.some(
                  (fieldMetadataItem) =>
                    fieldMetadataItem.id === column.fieldMetadataId,
                );

              const existsInSortDefinitions = sortableFieldMetadataItems.some(
                (fieldMetadataItem) =>
                  fieldMetadataItem.id === column.fieldMetadataId,
              );

              return {
                ...column,
                isFilterable: existsInFilterDefinitions,
                isSortable: existsInSortDefinitions,
              };
            });

        const newFieldDefinitions = mapViewFieldsToColumnDefinitions({
          viewFields,
          columnDefinitions,
        });

        setTableColumns(
          newFieldDefinitions,
          recordIndexId,
          objectMetadataItem.id,
        );

        const existingRecordIndexFieldDefinitions = snapshot
          .getLoadable(recordIndexFieldDefinitionsState)
          .getValue();
        if (
          !isDeeplyEqual(
            existingRecordIndexFieldDefinitions,
            newFieldDefinitions,
          )
        ) {
          set(recordIndexFieldDefinitionsState, newFieldDefinitions);
        }

        for (const viewField of viewFields) {
          const viewFieldMetadataType = objectMetadataItem.fields?.find(
            (field) => field.id === viewField.fieldMetadataId,
          )?.type;

          const aggregateOperationForViewField = snapshot
            .getLoadable(
              viewFieldAggregateOperationState({
                viewFieldId: viewField.id,
              }),
            )
            .getValue();
          const convertedViewFieldAggregateOperation = isDefined(
            viewField.aggregateOperation,
          )
            ? convertAggregateOperationToExtendedAggregateOperation(
                viewField.aggregateOperation,
                viewFieldMetadataType,
              )
            : viewField.aggregateOperation;

          if (
            aggregateOperationForViewField !==
            convertedViewFieldAggregateOperation
          ) {
            set(
              viewFieldAggregateOperationState({
                viewFieldId: viewField.id,
              }),
              convertedViewFieldAggregateOperation,
            );
          }
        }
      },
    [setTableColumns],
  );

  const loadRecordIndexStates = useRecoilCallback(
    ({ snapshot }) =>
      async (view: View, objectMetadataItem: ObjectMetadataItem) => {
        const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
          objectMetadataItem.namePlural,
          view.id,
        );

        const filterableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForFilterFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

        onViewFieldsChange(view.viewFields, objectMetadataItem, recordIndexId);

        setRecordGroupsFromViewGroups(
          view.id,
          view.viewGroups,
          objectMetadataItem,
        );

        setContextStoreTargetedRecordsRuleComponentState((prev) => ({
          ...prev,
          filters: mapViewFiltersToFilters(
            view.viewFilters,
            filterableFieldMetadataItems,
          ),
        }));

        setRecordIndexViewType(view.type);
        setRecordIndexOpenRecordIn(view.openRecordIn);
        setRecordIndexViewKanbanFieldMetadataIdState(
          // TODO: replace with viewGroups.fieldMetadataId
          view.kanbanFieldMetadataId,
        );
        const kanbanAggregateOperationFieldMetadataType =
          objectMetadataItem.fields?.find(
            (field) =>
              field.id === view.kanbanAggregateOperationFieldMetadataId,
          )?.type;
        setRecordIndexViewKanbanAggregateOperationState({
          operation: isDefined(view.kanbanAggregateOperation)
            ? convertAggregateOperationToExtendedAggregateOperation(
                view.kanbanAggregateOperation,
                kanbanAggregateOperationFieldMetadataType,
              )
            : view.kanbanAggregateOperation,
          fieldMetadataId: view.kanbanAggregateOperationFieldMetadataId,
        });
        setRecordIndexIsCompactModeActive(view.isCompact);
      },
    [
      onViewFieldsChange,
      setRecordGroupsFromViewGroups,
      setContextStoreTargetedRecordsRuleComponentState,
      setRecordIndexIsCompactModeActive,
      setRecordIndexViewKanbanAggregateOperationState,
      setRecordIndexViewKanbanFieldMetadataIdState,
      setRecordIndexViewType,
      setRecordIndexOpenRecordIn,
    ],
  );

  return {
    loadRecordIndexStates,
  };
};

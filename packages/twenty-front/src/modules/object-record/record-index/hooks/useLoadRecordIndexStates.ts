import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useSetRecordGroup } from '@/object-record/record-group/hooks/useSetRecordGroup';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { tableFiltersComponentState } from '@/object-record/record-table/states/tableFiltersComponentState';
import { tableSortsComponentState } from '@/object-record/record-table/states/tableSortsComponentState';
import { tableViewFilterGroupsComponentState } from '@/object-record/record-table/states/tableViewFilterGroupsComponentState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { View } from '@/views/types/View';
import { ViewField } from '@/views/types/ViewField';
import { ViewGroup } from '@/views/types/ViewGroup';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewGroupsToRecordGroupDefinitions } from '@/views/utils/mapViewGroupsToRecordGroupDefinitions';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useCallback } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadRecordIndexStates = () => {
  const setContextStoreTargetedRecordsRuleComponentState =
    useSetRecoilComponentStateV2(contextStoreTargetedRecordsRuleComponentState);

  const setRecordIndexViewFilterGroups = useSetRecoilState(
    recordIndexViewFilterGroupsState,
  );

  const setRecordIndexFilters = useSetRecoilState(recordIndexFiltersState);
  const setRecordIndexSorts = useSetRecoilState(recordIndexSortsState);
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
  const setRecordGroup = useSetRecordGroup();

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

        const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
          fields: activeFieldMetadataItems,
        });

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
              const existsInSortDefinitions = sortDefinitions.some(
                (sort) => sort.fieldMetadataId === column.fieldMetadataId,
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

        setTableColumns(newFieldDefinitions, recordIndexId);

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

  const onViewGroupsChange = useCallback(
    (
      viewGroups: ViewGroup[],
      objectMetadataItem: ObjectMetadataItem,
      recordIndexId: string,
    ) => {
      const newGroupDefinitions = mapViewGroupsToRecordGroupDefinitions({
        objectMetadataItem,
        viewGroups,
      });

      setRecordGroup(newGroupDefinitions, recordIndexId);
    },
    [setRecordGroup],
  );

  const loadRecordIndexStates = useRecoilCallback(
    ({ snapshot, set }) =>
      async (view: View, objectMetadataItem: ObjectMetadataItem) => {
        const recordIndexId = `${objectMetadataItem.namePlural}-${view.id}`;

        const filterableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForFilterFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

        onViewFieldsChange(view.viewFields, objectMetadataItem, recordIndexId);
        onViewGroupsChange(view.viewGroups, objectMetadataItem, recordIndexId);
        set(
          tableViewFilterGroupsComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
          view.viewFilterGroups ?? [],
        );
        set(
          tableFiltersComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
          mapViewFiltersToFilters(
            view.viewFilters,
            filterableFieldMetadataItems,
          ),
        );
        setRecordIndexFilters(
          mapViewFiltersToFilters(
            view.viewFilters,
            filterableFieldMetadataItems,
          ),
        );
        setRecordIndexViewFilterGroups(view.viewFilterGroups ?? []);
        setContextStoreTargetedRecordsRuleComponentState((prev) => ({
          ...prev,
          filters: mapViewFiltersToFilters(
            view.viewFilters,
            filterableFieldMetadataItems,
          ),
        }));

        const activeFieldMetadataItems = objectMetadataItem.fields.filter(
          ({ isActive, isSystem }) => isActive && !isSystem,
        );

        const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
          fields: activeFieldMetadataItems,
        });

        set(
          tableSortsComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
          mapViewSortsToSorts(view.viewSorts, sortDefinitions),
        );
        setRecordIndexSorts(
          mapViewSortsToSorts(view.viewSorts, sortDefinitions),
        );
        setRecordIndexViewType(view.type);
        setRecordIndexOpenRecordIn(view.openRecordIn);
        setRecordIndexViewKanbanFieldMetadataIdState(
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
      onViewGroupsChange,
      setContextStoreTargetedRecordsRuleComponentState,
      setRecordIndexFilters,
      setRecordIndexIsCompactModeActive,
      setRecordIndexSorts,
      setRecordIndexViewFilterGroups,
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

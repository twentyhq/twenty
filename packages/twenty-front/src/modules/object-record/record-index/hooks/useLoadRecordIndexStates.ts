import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { useSetRecordGroup } from '@/object-record/record-group/hooks/useSetRecordGroup';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useLazyPrefetchedData } from '@/prefetch/hooks/useLazyPrefetchData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const setContextStoreTargetedRecordsRuleComponentState =
    useSetRecoilComponentStateV2(contextStoreTargetedRecordsRuleComponentState);

  const { records: views, findManyRecords } = useLazyPrefetchedData(
    PrefetchKey.AllViews,
  );

  const recordIndexId = `${objectMetadataItem.namePlural}-${contextStoreCurrentViewId}`;
  console.log('recordIndexId', recordIndexId);

  const setRecordIndexViewFilterGroups = useSetRecoilState(
    recordIndexViewFilterGroupsState,
  );

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem?.id ?? '',
  );

  const setRecordIndexFilters = useSetRecoilState(recordIndexFiltersState);
  const setRecordIndexSorts = useSetRecoilState(recordIndexSortsState);
  const setRecordIndexIsCompactModeActive = useSetRecoilState(
    recordIndexIsCompactModeActiveState,
  );
  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);
  const setRecordIndexViewKanbanFieldMetadataIdState = useSetRecoilState(
    recordIndexKanbanFieldMetadataIdState,
  );
  const setRecordIndexViewKanbanAggregateOperationState = useSetRecoilState(
    recordIndexKanbanAggregateOperationState,
  );
  const setRecordGroup = useSetRecordGroup(recordIndexId);
  const {
    setTableViewFilterGroups,
    setTableFilters,
    setTableSorts,
    setTableColumns,
  } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const { columnDefinitions, sortDefinitions } =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem!);

  const onViewFieldsChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewFields: ViewField[]) => {
        if (!objectMetadataItem) {
          return;
        }

        const newFieldDefinitions = mapViewFieldsToColumnDefinitions({
          viewFields,
          columnDefinitions,
        });

        setTableColumns(newFieldDefinitions);

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
    [columnDefinitions, objectMetadataItem, setTableColumns],
  );

  const onViewGroupsChange = useCallback(
    (viewGroups: ViewGroup[]) => {
      if (!objectMetadataItem) {
        return;
      }

      const newGroupDefinitions = mapViewGroupsToRecordGroupDefinitions({
        objectMetadataItem,
        viewGroups,
      });

      setRecordGroup(newGroupDefinitions);
    },
    [objectMetadataItem, setRecordGroup],
  );

  const loadRecordIndexStates = useRecoilCallback(
    ({ set }) =>
      async () => {
        await findManyRecords();

        const view = views.find(
          (view) => view.id === contextStoreCurrentViewId,
        );

        if (!view || !objectMetadataItem) {
          return;
        }

        onViewFieldsChange(view.viewFields);
        onViewGroupsChange(view.viewGroups);
        setTableViewFilterGroups(view.viewFilterGroups ?? []);
        setTableFilters(
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
        setTableSorts(mapViewSortsToSorts(view.viewSorts, sortDefinitions));
        setRecordIndexSorts(
          mapViewSortsToSorts(view.viewSorts, sortDefinitions),
        );
        setRecordIndexViewType(view.type);
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
      filterableFieldMetadataItems,
      objectMetadataItem,
      onViewFieldsChange,
      onViewGroupsChange,
      setRecordIndexFilters,
      setRecordIndexIsCompactModeActive,
      setRecordIndexSorts,
      setRecordIndexViewFilterGroups,
      setRecordIndexViewKanbanAggregateOperationState,
      setRecordIndexViewKanbanFieldMetadataIdState,
      setRecordIndexViewType,
      setTableFilters,
      setTableSorts,
      setTableViewFilterGroups,
      sortDefinitions,
    ],
  );

  return {
    loadRecordIndexStates,
  };
};

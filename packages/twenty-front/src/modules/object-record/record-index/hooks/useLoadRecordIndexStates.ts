import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';

import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { clampRecordBoardColumnWidth } from '@/object-record/record-board/utils/clampRecordBoardColumnWidth';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { hasInitializedCurrentRecordFieldsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFieldsComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { hasInitializedCurrentRecordSortsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordSortsComponentFamilyState';
import { type View } from '@/views/types/View';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { atom, useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useLoadRecordIndexStates = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  const contextStoreTargetedRecordsRuleAtom =
    useAtomComponentStateCallbackState(
      contextStoreTargetedRecordsRuleComponentState,
    );

  const recordIndexGroupFieldMetadataItemAtom =
    useAtomComponentStateCallbackState(
      recordIndexGroupFieldMetadataItemComponentState,
    );

  const recordIndexGroupAggregateOperationAtom =
    useAtomComponentStateCallbackState(
      recordIndexGroupAggregateOperationComponentState,
    );

  const recordIndexGroupAggregateFieldMetadataItemAtom =
    useAtomComponentStateCallbackState(
      recordIndexGroupAggregateFieldMetadataItemComponentState,
    );

  const recordIndexShouldHideEmptyRecordGroupsAtom =
    useAtomComponentStateCallbackState(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const recordIndexKanbanColumnWidthAtom = useAtomComponentStateCallbackState(
    recordIndexKanbanColumnWidthComponentState,
  );

  const ambientViewInstanceId = useAvailableComponentInstanceId(
    ViewComponentInstanceContext,
  );

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const syncRecordIndexViewFields = useCallback(
    (
      view: Pick<View, 'id' | 'viewFields'>,
      objectMetadataItem: EnrichedObjectMetadataItem,
      options?: { skipGlobalIndexStates?: boolean; recordIndexId?: string },
    ) => {
      const activeFieldMetadataItems = objectMetadataItem.fields.filter(
        (field) => field.isActive && !isHiddenSystemField(field),
      );

      const filterableFieldMetadataItems = store.get(
        availableFieldMetadataItemsForFilterFamilySelector.selectorFamily({
          objectMetadataItemId: objectMetadataItem.id,
        }),
      );

      const sortableFieldMetadataItems = store.get(
        availableFieldMetadataItemsForSortFamilySelector.selectorFamily({
          objectMetadataItemId: objectMetadataItem.id,
        }),
      );

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
            const existsInFilterDefinitions = filterableFieldMetadataItems.some(
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
        viewFields: view.viewFields,
        columnDefinitions,
      });

      const recordFields = view.viewFields
        .map(mapViewFieldToRecordField)
        .filter(isDefined);

      const recordIndexId =
        options?.recordIndexId ??
        ambientViewInstanceId ??
        getRecordIndexIdFromObjectNamePluralAndViewId(
          objectMetadataItem.namePlural,
          view.id,
        );

      const recordIndexFieldDefinitionsAtom =
        recordIndexFieldDefinitionsState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
        });

      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
        });

      const hasInitializedFieldsAtom =
        hasInitializedCurrentRecordFieldsComponentFamilyState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
          familyKey: { viewId: view.id },
        });

      store.set(
        atom(null, (get, batchSet) => {
          const existingFieldDefs = get(recordIndexFieldDefinitionsAtom);

          if (!isDeeplyEqual(existingFieldDefs, newFieldDefinitions)) {
            batchSet(recordIndexFieldDefinitionsAtom, newFieldDefinitions);
          }

          for (const viewField of view.viewFields) {
            const viewFieldMetadataType = objectMetadataItem.fields?.find(
              (field) => field.id === viewField.fieldMetadataId,
            )?.type;

            const existingAggregateOp = get(
              viewFieldAggregateOperationState.atomFamily({
                viewFieldId: viewField.id,
              }),
            );

            const convertedViewFieldAggregateOp = isDefined(
              viewField.aggregateOperation,
            )
              ? convertAggregateOperationToExtendedAggregateOperation(
                  viewField.aggregateOperation,
                  viewFieldMetadataType,
                )
              : viewField.aggregateOperation;

            if (existingAggregateOp !== convertedViewFieldAggregateOp) {
              batchSet(
                viewFieldAggregateOperationState.atomFamily({
                  viewFieldId: viewField.id,
                }),
                convertedViewFieldAggregateOp,
              );
            }
          }

          const existingRecordFields = get(currentRecordFieldsAtom);

          if (!isDeeplyEqual(existingRecordFields, recordFields)) {
            batchSet(currentRecordFieldsAtom, recordFields);
          }

          batchSet(hasInitializedFieldsAtom, true);
        }),
      );
    },
    [ambientViewInstanceId, store, surfaceId],
  );

  const loadRecordIndexStates = useCallback(
    (
      view: View,
      objectMetadataItem: EnrichedObjectMetadataItem,
      options?: { skipGlobalIndexStates?: boolean; recordIndexId?: string },
    ) => {
      const flattenedFieldMetadataItems = store.get(
        flattenedFieldMetadataItemsSelector.atom,
      );
      const recordFilters = mapViewFiltersToFilters(
        view.viewFilters,
        flattenedFieldMetadataItems,
      );

      const recordFilterGroups = mapViewFilterGroupsToRecordFilterGroups(
        view.viewFilterGroups ?? [],
      );

      const contextStoreFilters = mapViewFiltersToFilters(
        view.viewFilters,
        flattenedFieldMetadataItems,
      );

      let recordIndexGroupFieldMetadataItemValue = undefined;
      if (isDefined(view.mainGroupByFieldMetadataId)) {
        const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow(
          view.mainGroupByFieldMetadataId,
        );
        recordIndexGroupFieldMetadataItemValue = fieldMetadataItem;
      }

      const recordIndexGroupAggregateFieldMetadataItemValue =
        objectMetadataItem.fields?.find(
          (field) => field.id === view.kanbanAggregateOperationFieldMetadataId,
        );

      let convertedAggregateOperation = undefined;
      if (isDefined(view.kanbanAggregateOperation)) {
        convertedAggregateOperation =
          convertAggregateOperationToExtendedAggregateOperation(
            view.kanbanAggregateOperation,
            recordIndexGroupAggregateFieldMetadataItemValue?.type,
          );
      }

      const recordIndexId =
        options?.recordIndexId ??
        ambientViewInstanceId ??
        getRecordIndexIdFromObjectNamePluralAndViewId(
          objectMetadataItem.namePlural,
          view.id,
        );

      const recordIndexViewTypeAtom = recordIndexViewTypeState.atomFamily({
        instanceId: recordIndexId,
        surfaceId,
      });

      const currentRecordFiltersAtom =
        currentRecordFiltersComponentState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
        });
      const anyFieldFilterValueAtom =
        anyFieldFilterValueComponentState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
        });
      const currentRecordFilterGroupsAtom =
        currentRecordFilterGroupsComponentState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
        });
      const currentRecordSortsAtom =
        currentRecordSortsComponentState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
        });

      const hasInitializedFiltersAtom =
        hasInitializedCurrentRecordFiltersComponentFamilyState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
          familyKey: { viewId: view.id },
        });
      const hasInitializedSortsAtom =
        hasInitializedCurrentRecordSortsComponentFamilyState.atomFamily({
          instanceId: recordIndexId,
          surfaceId,
          familyKey: { viewId: view.id },
        });

      syncRecordIndexViewFields(view, objectMetadataItem, {
        recordIndexId,
      });

      store.set(
        atom(null, (get, batchSet) => {
          batchSet(currentRecordFiltersAtom, recordFilters);
          batchSet(currentRecordFilterGroupsAtom, recordFilterGroups);
          batchSet(anyFieldFilterValueAtom, view.anyFieldFilterValue ?? '');
          batchSet(hasInitializedFiltersAtom, true);

          batchSet(currentRecordSortsAtom, view.viewSorts);
          batchSet(hasInitializedSortsAtom, true);

          const prevRule = get(contextStoreTargetedRecordsRuleAtom);
          batchSet(contextStoreTargetedRecordsRuleAtom, {
            ...prevRule,
            filters: contextStoreFilters,
          });

          batchSet(recordIndexViewTypeAtom, view.type);

          const recordCalendarInstanceId = recordIndexId;

          if (isDefined(recordCalendarInstanceId)) {
            batchSet(
              recordIndexCalendarFieldMetadataIdComponentState.atomFamily({
                instanceId: recordCalendarInstanceId,
                surfaceId,
              }),
              view.calendarFieldMetadataId ?? null,
            );
            batchSet(
              recordIndexCalendarLayoutComponentState.atomFamily({
                instanceId: recordCalendarInstanceId,
                surfaceId,
              }),
              view.calendarLayout ?? ViewCalendarLayout.MONTH,
            );
          }

          batchSet(
            recordIndexShouldHideEmptyRecordGroupsAtom,
            view.shouldHideEmptyGroups,
          );

          batchSet(
            recordIndexKanbanColumnWidthAtom,
            clampRecordBoardColumnWidth(
              view.kanbanColumnWidth ?? RECORD_BOARD_COLUMN_WIDTH,
            ),
          );

          if (isDefined(recordIndexGroupFieldMetadataItemValue)) {
            batchSet(
              recordIndexGroupFieldMetadataItemAtom,
              recordIndexGroupFieldMetadataItemValue,
            );
          }

          if (isDefined(convertedAggregateOperation)) {
            batchSet(
              recordIndexGroupAggregateOperationAtom,
              convertedAggregateOperation,
            );
          }

          if (isDefined(recordIndexGroupAggregateFieldMetadataItemValue)) {
            batchSet(
              recordIndexGroupAggregateFieldMetadataItemAtom,
              recordIndexGroupAggregateFieldMetadataItemValue,
            );
          }
        }),
      );

      setRecordGroupsFromViewGroups({
        viewId: view.id,
        mainGroupByFieldMetadataId: view.mainGroupByFieldMetadataId ?? '',
        viewGroups: view.viewGroups,
        objectMetadataItem,
        recordIndexId,
      });
    },
    [
      store,
      ambientViewInstanceId,
      contextStoreTargetedRecordsRuleAtom,
      recordIndexGroupFieldMetadataItemAtom,
      recordIndexGroupAggregateOperationAtom,
      recordIndexGroupAggregateFieldMetadataItemAtom,
      recordIndexShouldHideEmptyRecordGroupsAtom,
      recordIndexKanbanColumnWidthAtom,
      getFieldMetadataItemByIdOrThrow,
      setRecordGroupsFromViewGroups,
      syncRecordIndexViewFields,
      surfaceId,
    ],
  );

  return {
    loadRecordIndexStates,
    syncRecordIndexViewFields,
  };
};

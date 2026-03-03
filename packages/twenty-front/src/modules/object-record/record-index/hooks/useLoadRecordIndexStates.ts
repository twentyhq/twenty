import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';

import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { hasInitializedCurrentRecordFieldsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFieldsComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { hasInitializedCurrentRecordSortsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordSortsComponentFamilyState';
import { type View } from '@/views/types/View';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { atom, useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadRecordIndexStates = () => {
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

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const loadRecordIndexStates = useCallback(
    (view: View, objectMetadataItem: ObjectMetadataItem) => {
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

      const allFilterableFields = getFilterableFields(objectMetadataItem);
      const recordFilters = mapViewFiltersToFilters(
        view.viewFilters,
        allFilterableFields,
      );

      const contextStoreFilters = mapViewFiltersToFilters(
        view.viewFilters,
        filterableFieldMetadataItems,
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

      const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
        objectMetadataItem.namePlural,
        view.id,
      );

      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordIndexId,
        });
      const currentRecordFiltersAtom =
        currentRecordFiltersComponentState.atomFamily({
          instanceId: recordIndexId,
        });
      const currentRecordSortsAtom =
        currentRecordSortsComponentState.atomFamily({
          instanceId: recordIndexId,
        });

      const hasInitializedFieldsAtom =
        hasInitializedCurrentRecordFieldsComponentFamilyState.atomFamily({
          instanceId: recordIndexId,
          familyKey: { viewId: view.id },
        });
      const hasInitializedFiltersAtom =
        hasInitializedCurrentRecordFiltersComponentFamilyState.atomFamily({
          instanceId: recordIndexId,
          familyKey: { viewId: view.id },
        });
      const hasInitializedSortsAtom =
        hasInitializedCurrentRecordSortsComponentFamilyState.atomFamily({
          instanceId: recordIndexId,
          familyKey: { viewId: view.id },
        });

      store.set(
        atom(null, (get, batchSet) => {
          const existingFieldDefs = get(recordIndexFieldDefinitionsState.atom);
          if (!isDeeplyEqual(existingFieldDefs, newFieldDefinitions)) {
            batchSet(
              recordIndexFieldDefinitionsState.atom,
              newFieldDefinitions,
            );
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

          batchSet(currentRecordFieldsAtom, recordFields);
          batchSet(hasInitializedFieldsAtom, true);

          batchSet(currentRecordFiltersAtom, recordFilters);
          batchSet(hasInitializedFiltersAtom, true);

          batchSet(currentRecordSortsAtom, view.viewSorts);
          batchSet(hasInitializedSortsAtom, true);

          const prevRule = get(contextStoreTargetedRecordsRuleAtom);
          batchSet(contextStoreTargetedRecordsRuleAtom, {
            ...prevRule,
            filters: contextStoreFilters,
          });

          batchSet(recordIndexViewTypeState.atom, view.type);
          batchSet(recordIndexOpenRecordInState.atom, view.openRecordIn);

          batchSet(
            recordIndexCalendarFieldMetadataIdState.atom,
            view.calendarFieldMetadataId ?? null,
          );

          batchSet(
            recordIndexShouldHideEmptyRecordGroupsAtom,
            view.shouldHideEmptyGroups,
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
      });
    },
    [
      store,
      contextStoreTargetedRecordsRuleAtom,
      recordIndexGroupFieldMetadataItemAtom,
      recordIndexGroupAggregateOperationAtom,
      recordIndexGroupAggregateFieldMetadataItemAtom,
      recordIndexShouldHideEmptyRecordGroupsAtom,
      getFieldMetadataItemByIdOrThrow,
      setRecordGroupsFromViewGroups,
    ],
  );

  return {
    loadRecordIndexStates,
  };
};

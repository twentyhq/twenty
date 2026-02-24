import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';

import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexOpenRecordInStateV2 } from '@/object-record/record-index/states/recordIndexOpenRecordInStateV2';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { type View } from '@/views/types/View';
import { type ViewField } from '@/views/types/ViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadRecordIndexStates = () => {
  const store = useStore();

  const setContextStoreTargetedRecordsRuleComponentState =
    useSetRecoilComponentStateV2(contextStoreTargetedRecordsRuleComponentState);

  const setRecordIndexViewType = useSetRecoilStateV2(recordIndexViewTypeState);
  const setRecordIndexOpenRecordIn = useSetRecoilStateV2(
    recordIndexOpenRecordInState,
  );

  const setRecordIndexGroupFieldMetadataItem = useSetRecoilComponentStateV2(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const setRecordIndexGroupAggregateOperation = useSetRecoilComponentStateV2(
    recordIndexGroupAggregateOperationComponentState,
  );

  const setRecordIndexGroupAggregateFieldMetadataItem =
    useSetRecoilComponentStateV2(
      recordIndexGroupAggregateFieldMetadataItemComponentState,
    );

  const setRecordIndexShouldHideEmptyRecordGroups =
    useSetRecoilComponentStateV2(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const setRecordIndexCalendarFieldMetadataIdState = useSetRecoilStateV2(
    recordIndexCalendarFieldMetadataIdState,
  );

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const onViewFieldsChange = useCallback(
    (viewFields: ViewField[], objectMetadataItem: ObjectMetadataItem) => {
      const activeFieldMetadataItems = objectMetadataItem.fields.filter(
        (field) => field.isActive && !isHiddenSystemField(field),
      );

      const filterableFieldMetadataItems = jotaiStore.get(
        availableFieldMetadataItemsForFilterFamilySelector.selectorFamily({
          objectMetadataItemId: objectMetadataItem.id,
        }),
      );

      const sortableFieldMetadataItems = jotaiStore.get(
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
        viewFields,
        columnDefinitions,
      });

      const existingRecordIndexFieldDefinitions = jotaiStore.get(
        recordIndexFieldDefinitionsState.atom,
      );

      if (
        !isDeeplyEqual(existingRecordIndexFieldDefinitions, newFieldDefinitions)
      ) {
        jotaiStore.set(
          recordIndexFieldDefinitionsState.atom,
          newFieldDefinitions,
        );
      }

      for (const viewField of viewFields) {
        const viewFieldMetadataType = objectMetadataItem.fields?.find(
          (field) => field.id === viewField.fieldMetadataId,
        )?.type;

        const aggregateOperationForViewField = jotaiStore.get(
          viewFieldAggregateOperationState.atomFamily({
            viewFieldId: viewField.id,
          }),
        );
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
          jotaiStore.set(
            viewFieldAggregateOperationState.atomFamily({
              viewFieldId: viewField.id,
            }),
            convertedViewFieldAggregateOperation,
          );
        }
      }
    },
    [],
  );

  const loadRecordIndexStates = useCallback(
    async (view: View, objectMetadataItem: ObjectMetadataItem) => {
      const filterableFieldMetadataItems = jotaiStore.get(
        availableFieldMetadataItemsForFilterFamilySelector.selectorFamily({
          objectMetadataItemId: objectMetadataItem.id,
        }),
      );

      onViewFieldsChange(view.viewFields, objectMetadataItem);

      setRecordGroupsFromViewGroups({
        viewId: view.id,
        mainGroupByFieldMetadataId: view.mainGroupByFieldMetadataId ?? '',
        viewGroups: view.viewGroups,
        objectMetadataItem,
      });

      setContextStoreTargetedRecordsRuleComponentState((prev) => ({
        ...prev,
        filters: mapViewFiltersToFilters(
          view.viewFilters,
          filterableFieldMetadataItems,
        ),
      }));

      setRecordIndexViewType(view.type);
      setRecordIndexOpenRecordIn(view.openRecordIn);
      store.set(recordIndexOpenRecordInStateV2.atom, view.openRecordIn);

      setRecordIndexCalendarFieldMetadataIdState(
        view.calendarFieldMetadataId ?? null,
      );

      setRecordIndexShouldHideEmptyRecordGroups(view.shouldHideEmptyGroups);

      if (isDefined(view.mainGroupByFieldMetadataId)) {
        const recordIndexGroupFieldMetadataItemId =
          view.mainGroupByFieldMetadataId;

        const { fieldMetadataItem: recordIndexGroupFieldMetadataItem } =
          getFieldMetadataItemByIdOrThrow(recordIndexGroupFieldMetadataItemId);

        setRecordIndexGroupFieldMetadataItem(recordIndexGroupFieldMetadataItem);
      }

      const recordIndexGroupAggregateFieldMetadataItem =
        objectMetadataItem.fields?.find(
          (field) => field.id === view.kanbanAggregateOperationFieldMetadataId,
        );

      if (isDefined(view.kanbanAggregateOperation)) {
        const convertedAggregateOperation =
          convertAggregateOperationToExtendedAggregateOperation(
            view.kanbanAggregateOperation,
            recordIndexGroupAggregateFieldMetadataItem?.type,
          );

        setRecordIndexGroupAggregateOperation(convertedAggregateOperation);
      }

      if (isDefined(recordIndexGroupAggregateFieldMetadataItem)) {
        setRecordIndexGroupAggregateFieldMetadataItem(
          recordIndexGroupAggregateFieldMetadataItem,
        );
      }
    },
    [
      onViewFieldsChange,
      setRecordGroupsFromViewGroups,
      setContextStoreTargetedRecordsRuleComponentState,
      setRecordIndexViewType,
      setRecordIndexOpenRecordIn,
      setRecordIndexCalendarFieldMetadataIdState,
      setRecordIndexShouldHideEmptyRecordGroups,
      setRecordIndexGroupAggregateFieldMetadataItem,
      setRecordIndexGroupAggregateOperation,
      getFieldMetadataItemByIdOrThrow,
      setRecordIndexGroupFieldMetadataItem,
      store,
    ],
  );

  return {
    loadRecordIndexStates,
  };
};

import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';

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
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type View } from '@/views/types/View';
import { type ViewField } from '@/views/types/ViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadRecordIndexStates = () => {
  const setContextStoreTargetedRecordsRuleComponentState =
    useSetRecoilComponentState(contextStoreTargetedRecordsRuleComponentState);

  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);
  const setRecordIndexOpenRecordIn = useSetRecoilState(
    recordIndexOpenRecordInState,
  );

  const setRecordIndexGroupFieldMetadataItem = useSetRecoilComponentState(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const setRecordIndexGroupAggregateOperation = useSetRecoilComponentState(
    recordIndexGroupAggregateOperationComponentState,
  );

  const setRecordIndexGroupAggregateFieldMetadataItem =
    useSetRecoilComponentState(
      recordIndexGroupAggregateFieldMetadataItemComponentState,
    );

  const setRecordIndexShouldHideEmptyRecordGroups = useSetRecoilComponentState(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const setRecordIndexCalendarFieldMetadataIdState = useSetRecoilState(
    recordIndexCalendarFieldMetadataIdState,
  );

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const onViewFieldsChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewFields: ViewField[], objectMetadataItem: ObjectMetadataItem) => {
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
    [],
  );

  const loadRecordIndexStates = useRecoilCallback(
    ({ snapshot }) =>
      async (view: View, objectMetadataItem: ObjectMetadataItem) => {
        const filterableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForFilterFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

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

        setRecordIndexCalendarFieldMetadataIdState(
          view.calendarFieldMetadataId ?? null,
        );

        setRecordIndexShouldHideEmptyRecordGroups(view.shouldHideEmptyGroups);

        if (isDefined(view.mainGroupByFieldMetadataId)) {
          const recordIndexGroupFieldMetadataItemId =
            view.mainGroupByFieldMetadataId;

          const { fieldMetadataItem: recordIndexGroupFieldMetadataItem } =
            getFieldMetadataItemByIdOrThrow(
              recordIndexGroupFieldMetadataItemId,
            );

          setRecordIndexGroupFieldMetadataItem(
            recordIndexGroupFieldMetadataItem,
          );
        }

        const recordIndexGroupAggregateFieldMetadataItem =
          objectMetadataItem.fields?.find(
            (field) =>
              field.id === view.kanbanAggregateOperationFieldMetadataId,
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
    ],
  );

  return {
    loadRecordIndexStates,
  };
};

import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getEditableChipObjectFilterDropdownComponentInstanceId } from '@/views/editable-chip/utils/getEditableChipObjectFilterDropdownComponentInstanceId';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSetEditableFilterChipDropdownStates = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const store = useStore();

  const setEditableFilterChipDropdownStates = useCallback(
    (
      recordFilter: RecordFilter,
      objectFilterDropdownComponentInstanceIdFromProps?: string,
    ) => {
      const fieldMetadataItem = filterableFieldMetadataItems.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === recordFilter.fieldMetadataId,
      );
      const objectFilterDropdownComponentInstanceId =
        objectFilterDropdownComponentInstanceIdFromProps ??
        getEditableChipObjectFilterDropdownComponentInstanceId({
          recordFilterId: recordFilter.id,
        });

      if (isDefined(fieldMetadataItem)) {
        store.set(
          fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
            instanceId: objectFilterDropdownComponentInstanceId,
          }),
          fieldMetadataItem.id,
        );
      }

      store.set(
        selectedOperandInDropdownComponentState.atomFamily({
          instanceId: objectFilterDropdownComponentInstanceId,
        }),
        recordFilter.operand,
      );

      store.set(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: objectFilterDropdownComponentInstanceId,
        }),
        recordFilter,
      );

      store.set(
        subFieldNameUsedInDropdownComponentState.atomFamily({
          instanceId: objectFilterDropdownComponentInstanceId,
        }),
        recordFilter.subFieldName,
      );

      store.set(
        relationTargetFieldMetadataIdUsedInDropdownComponentState.atomFamily({
          instanceId: objectFilterDropdownComponentInstanceId,
        }),
        recordFilter.relationTargetFieldMetadataId ?? null,
      );
    },
    [store, filterableFieldMetadataItems],
  );

  return {
    setEditableFilterChipDropdownStates,
  };
};

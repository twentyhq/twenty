import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useSetRecordFilterUsedInAdvancedFilterDropdownRow = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const setRecordFilterUsedInAdvancedFilterDropdownRow = useCallback(
    (recordFilter: RecordFilter) => {
      const advancedFilterRowObjectFilterDropdownComponentInstanceId =
        getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        );

      store.set(
        fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
          surfaceId,
        }),
        recordFilter.fieldMetadataId,
      );

      store.set(
        selectedOperandInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
          surfaceId,
        }),
        recordFilter.operand,
      );

      store.set(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
          surfaceId,
        }),
        recordFilter,
      );

      store.set(
        subFieldNameUsedInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
          surfaceId,
        }),
        recordFilter.subFieldName,
      );

      store.set(
        relationTargetFieldMetadataIdUsedInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
          surfaceId,
        }),
        recordFilter.relationTargetFieldMetadataId ?? null,
      );
    },
    [store, surfaceId],
  );

  return {
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  };
};

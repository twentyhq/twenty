import { useCallback } from 'react';

import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';

export const useResetFilterDropdown = (componentInstanceId?: string) => {
  const store = useStore();
  const objectFilterDropdownSearchInput =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const fieldMetadataItemIdUsedInDropdown =
    useRecoilComponentStateCallbackStateV2(
      fieldMetadataItemIdUsedInDropdownComponentState,
      componentInstanceId,
    );

  const selectedOperandInDropdown = useRecoilComponentStateCallbackStateV2(
    selectedOperandInDropdownComponentState,
    componentInstanceId,
  );

  const objectFilterDropdownFilterIsSelected =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownFilterIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownAnyFieldSearchIsSelected =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownIsSelectingCompositeField =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilter =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const resetFilterDropdown = useCallback(() => {
    store.set(objectFilterDropdownSearchInput, '');
    store.set(selectedOperandInDropdown, null);
    store.set(objectFilterDropdownFilterIsSelected, false);
    store.set(objectFilterDropdownIsSelectingCompositeField, false);
    store.set(fieldMetadataItemIdUsedInDropdown, null);
    store.set(objectFilterDropdownCurrentRecordFilter, null);
    store.set(objectFilterDropdownAnyFieldSearchIsSelected, false);
  }, [
    objectFilterDropdownSearchInput,
    selectedOperandInDropdown,
    objectFilterDropdownFilterIsSelected,
    objectFilterDropdownIsSelectingCompositeField,
    fieldMetadataItemIdUsedInDropdown,
    objectFilterDropdownCurrentRecordFilter,
    objectFilterDropdownAnyFieldSearchIsSelected,
    store,
  ]);

  return {
    resetFilterDropdown,
  };
};

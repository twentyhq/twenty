import { useCallback } from 'react';

import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';

export const useResetFilterDropdown = (componentInstanceId?: string) => {
  const store = useStore();
  const objectFilterDropdownSearchInput = useAtomComponentStateCallbackState(
    objectFilterDropdownSearchInputComponentState,
    componentInstanceId,
  );

  const fieldMetadataItemIdUsedInDropdown = useAtomComponentStateCallbackState(
    fieldMetadataItemIdUsedInDropdownComponentState,
    componentInstanceId,
  );

  const selectedOperandInDropdown = useAtomComponentStateCallbackState(
    selectedOperandInDropdownComponentState,
    componentInstanceId,
  );

  const objectFilterDropdownFilterIsSelected =
    useAtomComponentStateCallbackState(
      objectFilterDropdownFilterIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownAnyFieldSearchIsSelected =
    useAtomComponentStateCallbackState(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownIsSelectingCompositeField =
    useAtomComponentStateCallbackState(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilter =
    useAtomComponentStateCallbackState(
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

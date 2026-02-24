import { useCallback } from 'react';

import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

export const useResetFilterDropdown = (componentInstanceId?: string) => {
  const objectFilterDropdownSearchInputAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const fieldMetadataItemIdUsedInDropdownAtom =
    useRecoilComponentStateCallbackStateV2(
      fieldMetadataItemIdUsedInDropdownComponentState,
      componentInstanceId,
    );

  const selectedOperandInDropdownAtom = useRecoilComponentStateCallbackStateV2(
    selectedOperandInDropdownComponentState,
    componentInstanceId,
  );

  const objectFilterDropdownFilterIsSelectedAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownFilterIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownAnyFieldSearchIsSelectedAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownIsSelectingCompositeFieldAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilterAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const resetFilterDropdown = useCallback(() => {
    jotaiStore.set(objectFilterDropdownSearchInputAtom, '');
    jotaiStore.set(selectedOperandInDropdownAtom, null);
    jotaiStore.set(objectFilterDropdownFilterIsSelectedAtom, false);
    jotaiStore.set(objectFilterDropdownIsSelectingCompositeFieldAtom, false);
    jotaiStore.set(fieldMetadataItemIdUsedInDropdownAtom, null);
    jotaiStore.set(objectFilterDropdownCurrentRecordFilterAtom, null);
    jotaiStore.set(objectFilterDropdownAnyFieldSearchIsSelectedAtom, false);
  }, [
    objectFilterDropdownSearchInputAtom,
    selectedOperandInDropdownAtom,
    objectFilterDropdownFilterIsSelectedAtom,
    objectFilterDropdownIsSelectingCompositeFieldAtom,
    fieldMetadataItemIdUsedInDropdownAtom,
    objectFilterDropdownCurrentRecordFilterAtom,
    objectFilterDropdownAnyFieldSearchIsSelectedAtom,
  ]);

  return {
    resetFilterDropdown,
  };
};

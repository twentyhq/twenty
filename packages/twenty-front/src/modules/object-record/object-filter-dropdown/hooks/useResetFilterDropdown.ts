import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useResetFilterDropdown = (componentInstanceId?: string) => {
  const objectFilterDropdownSearchInputCallbackState =
    useRecoilComponentCallbackState(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const fieldMetadataItemIdUsedInDropdownCallbackState =
    useRecoilComponentCallbackState(
      fieldMetadataItemIdUsedInDropdownComponentState,
      componentInstanceId,
    );

  const selectedOperandInDropdownCallbackState =
    useRecoilComponentCallbackState(
      selectedOperandInDropdownComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownFilterIsSelectedCallbackState =
    useRecoilComponentCallbackState(
      objectFilterDropdownFilterIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownAnyFieldSearchIsSelectedCallbackState =
    useRecoilComponentCallbackState(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownIsSelectingCompositeFieldCallbackState =
    useRecoilComponentCallbackState(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilterCallbackState =
    useRecoilComponentCallbackState(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const resetFilterDropdown = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputCallbackState, '');
        set(selectedOperandInDropdownCallbackState, null);
        set(objectFilterDropdownFilterIsSelectedCallbackState, false);
        set(objectFilterDropdownIsSelectingCompositeFieldCallbackState, false);
        set(fieldMetadataItemIdUsedInDropdownCallbackState, null);
        set(objectFilterDropdownCurrentRecordFilterCallbackState, null);
        set(objectFilterDropdownAnyFieldSearchIsSelectedCallbackState, false);
      },
    [
      objectFilterDropdownSearchInputCallbackState,
      selectedOperandInDropdownCallbackState,
      objectFilterDropdownFilterIsSelectedCallbackState,
      objectFilterDropdownIsSelectingCompositeFieldCallbackState,
      fieldMetadataItemIdUsedInDropdownCallbackState,
      objectFilterDropdownCurrentRecordFilterCallbackState,
      objectFilterDropdownAnyFieldSearchIsSelectedCallbackState,
    ],
  );

  return {
    resetFilterDropdown,
  };
};

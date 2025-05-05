import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useResetFilterDropdown = (componentInstanceId?: string) => {
  const objectFilterDropdownSearchInputCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const fieldMetadataItemIdUsedInDropdownCallbackState =
    useRecoilComponentCallbackStateV2(
      fieldMetadataItemIdUsedInDropdownComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownSelectedRecordIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownSelectedRecordIdsComponentState,
      componentInstanceId,
    );

  const selectedOperandInDropdownCallbackState =
    useRecoilComponentCallbackStateV2(
      selectedOperandInDropdownComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownFilterIsSelectedCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownFilterIsSelectedComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownIsSelectingCompositeFieldCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilterCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const resetFilterDropdown = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputCallbackState, '');
        set(objectFilterDropdownSelectedRecordIdsCallbackState, []);
        set(selectedOperandInDropdownCallbackState, null);
        set(objectFilterDropdownFilterIsSelectedCallbackState, false);
        set(objectFilterDropdownIsSelectingCompositeFieldCallbackState, false);
        set(fieldMetadataItemIdUsedInDropdownCallbackState, null);
        set(objectFilterDropdownCurrentRecordFilterCallbackState, null);
      },
    [
      objectFilterDropdownSearchInputCallbackState,
      objectFilterDropdownSelectedRecordIdsCallbackState,
      selectedOperandInDropdownCallbackState,
      objectFilterDropdownFilterIsSelectedCallbackState,
      objectFilterDropdownIsSelectingCompositeFieldCallbackState,
      fieldMetadataItemIdUsedInDropdownCallbackState,
      objectFilterDropdownCurrentRecordFilterCallbackState,
    ],
  );

  return {
    resetFilterDropdown,
  };
};

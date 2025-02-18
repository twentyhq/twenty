import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
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

  const selectedFilterCallbackState = useRecoilComponentCallbackStateV2(
    selectedFilterComponentState,
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

  const resetFilterDropdown = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputCallbackState, '');
        set(objectFilterDropdownSelectedRecordIdsCallbackState, []);
        set(selectedFilterCallbackState, undefined);
        set(selectedOperandInDropdownCallbackState, null);
        set(objectFilterDropdownFilterIsSelectedCallbackState, false);
        set(objectFilterDropdownIsSelectingCompositeFieldCallbackState, false);
        set(fieldMetadataItemIdUsedInDropdownCallbackState, null);
      },
    [
      objectFilterDropdownSearchInputCallbackState,
      objectFilterDropdownSelectedRecordIdsCallbackState,
      selectedFilterCallbackState,
      selectedOperandInDropdownCallbackState,
      objectFilterDropdownFilterIsSelectedCallbackState,
      objectFilterDropdownIsSelectingCompositeFieldCallbackState,
      fieldMetadataItemIdUsedInDropdownCallbackState,
    ],
  );

  return {
    resetFilterDropdown,
  };
};

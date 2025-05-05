import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useEmptyRecordFilter = (componentInstanceId?: string) => {
  const objectFilterDropdownSearchInputCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownSelectedRecordIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownSelectedRecordIdsComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilter =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const emptyRecordFilter = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputCallbackState, '');
        set(objectFilterDropdownSelectedRecordIdsCallbackState, []);
        set(objectFilterDropdownCurrentRecordFilter, undefined);
      },
    [
      objectFilterDropdownSearchInputCallbackState,
      objectFilterDropdownSelectedRecordIdsCallbackState,
      objectFilterDropdownCurrentRecordFilter,
    ],
  );

  return {
    emptyRecordFilter,
  };
};

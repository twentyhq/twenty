import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useResetRecordSortDropdownSearchInput = () => {
  const objectSortDropdownSearchInputCallbackState =
    useRecoilComponentCallbackStateV2(
      objectSortDropdownSearchInputComponentState,
    );

  const resetRecordSortDropdownSearchInput = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectSortDropdownSearchInputCallbackState, '');
      },
    [objectSortDropdownSearchInputCallbackState],
  );

  return {
    resetRecordSortDropdownSearchInput,
  };
};

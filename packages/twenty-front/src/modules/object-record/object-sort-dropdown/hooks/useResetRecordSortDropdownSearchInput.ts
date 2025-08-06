import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useResetRecordSortDropdownSearchInput = () => {
  const objectSortDropdownSearchInputCallbackState =
    useRecoilComponentCallbackState(
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

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useEmptyRecordFilter = (componentInstanceId?: string) => {
  const objectFilterDropdownSearchInputCallbackState =
    useRecoilComponentCallbackState(
      objectFilterDropdownSearchInputComponentState,
      componentInstanceId,
    );

  const objectFilterDropdownCurrentRecordFilter =
    useRecoilComponentCallbackState(
      objectFilterDropdownCurrentRecordFilterComponentState,
      componentInstanceId,
    );

  const emptyRecordFilter = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputCallbackState, '');
        set(objectFilterDropdownCurrentRecordFilter, undefined);
      },
    [
      objectFilterDropdownSearchInputCallbackState,
      objectFilterDropdownCurrentRecordFilter,
    ],
  );

  return {
    emptyRecordFilter,
  };
};

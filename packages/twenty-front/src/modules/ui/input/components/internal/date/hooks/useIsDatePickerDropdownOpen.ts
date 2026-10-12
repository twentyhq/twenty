import { getDatePickerDropdownIds } from '@/ui/input/components/internal/date/utils/getDatePickerDropdownIds';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useIsDatePickerDropdownOpen = () => {
  const store = useStore();

  const isDatePickerDropdownOpen = useCallback(
    (datePickerInstanceId: string) =>
      Object.values(getDatePickerDropdownIds(datePickerInstanceId)).some(
        (dropdownId) =>
          store.get(
            isDropdownOpenComponentState.atomFamily({
              instanceId: dropdownId,
            }),
          ),
      ),
    [store],
  );

  return { isDatePickerDropdownOpen };
};

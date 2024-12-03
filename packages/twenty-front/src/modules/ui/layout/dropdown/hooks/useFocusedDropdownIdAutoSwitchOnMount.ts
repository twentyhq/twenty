import { focusedDropdownIdState } from '@/ui/layout/dropdown/states/focusedDropdownIdState';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useFocusedDropdownIdAutoSwitchOnMount = ({
  dropdownId,
  parentDropdownId,
}: {
  dropdownId: string;
  parentDropdownId?: string;
}) => {
  const [focusedDropdownId, setFocusedDropdownId] = useRecoilState(
    focusedDropdownIdState,
  );

  useEffect(() => {
    console.log(
      `useFocusedDropdownIdAutoSwitchOnMount: currently on ${focusedDropdownId}, will switch to ${dropdownId} with parent ${parentDropdownId}`,
    );
    setFocusedDropdownId(dropdownId);

    return () => {
      console.log(
        `useFocusedDropdownIdAutoSwitchOnMount: unmounting ${dropdownId}, with parent ${parentDropdownId}`,
      );

      if (focusedDropdownId === dropdownId && isDefined(parentDropdownId)) {
        setFocusedDropdownId(parentDropdownId);
      } else {
        setFocusedDropdownId(null);
      }
    };
  }, [dropdownId, focusedDropdownId, parentDropdownId, setFocusedDropdownId]);
};

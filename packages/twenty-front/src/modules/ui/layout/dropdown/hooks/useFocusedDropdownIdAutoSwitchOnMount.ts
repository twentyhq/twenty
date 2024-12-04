import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
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
  const [activeDropdownFocusId, setActiveDropdownFocusId] = useRecoilState(
    activeDropdownFocusIdState,
  );

  useEffect(() => {
    console.log(
      `useFocusedDropdownIdAutoSwitchOnMount: currently on ${activeDropdownFocusId}, will switch to ${dropdownId} with parent ${parentDropdownId}`,
    );
    setActiveDropdownFocusId(dropdownId);

    return () => {
      console.log(
        `useFocusedDropdownIdAutoSwitchOnMount: unmounting ${dropdownId}, with parent ${parentDropdownId}`,
      );

      if (activeDropdownFocusId === dropdownId && isDefined(parentDropdownId)) {
        setActiveDropdownFocusId(parentDropdownId);
      } else {
        setActiveDropdownFocusId(null);
      }
    };
  }, [
    dropdownId,
    activeDropdownFocusId,
    parentDropdownId,
    setActiveDropdownFocusId,
  ]);
};

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect } from 'react';

export const RecordTableColumnHeadDropdownScrollEffect = () => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );
  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    toggleScrollXWrapper(false);
    toggleScrollYWrapper(false);

    return () => {
      toggleScrollXWrapper(true);
      toggleScrollYWrapper(true);
    };
  }, [isDropdownOpen, toggleScrollXWrapper, toggleScrollYWrapper]);

  return null;
};

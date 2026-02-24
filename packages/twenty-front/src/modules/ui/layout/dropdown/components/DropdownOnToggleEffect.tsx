import { useEffect, useState } from 'react';

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const DropdownOnToggleEffect = ({
  onDropdownClose,
  onDropdownOpen,
}: {
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const isDropdownOpen = useAtomComponentValue(isDropdownOpenComponentState);

  const [currentIsDropdownOpen, setCurrentIsDropdownOpen] =
    useState(isDropdownOpen);

  useEffect(() => {
    if (isDropdownOpen && !currentIsDropdownOpen) {
      setCurrentIsDropdownOpen(isDropdownOpen);
      onDropdownOpen?.();
    }

    if (!isDropdownOpen && currentIsDropdownOpen) {
      setCurrentIsDropdownOpen(isDropdownOpen);
      onDropdownClose?.();
    }
  }, [currentIsDropdownOpen, isDropdownOpen, onDropdownClose, onDropdownOpen]);

  return null;
};

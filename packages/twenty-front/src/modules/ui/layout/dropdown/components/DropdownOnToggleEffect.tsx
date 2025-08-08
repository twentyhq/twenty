import { useEffect, useState } from 'react';

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const DropdownOnToggleEffect = ({
  onDropdownClose,
  onDropdownOpen,
}: {
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const isDropdownOpen = useRecoilComponentValue(isDropdownOpenComponentState);

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

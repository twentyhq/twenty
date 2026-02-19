import { useEffect, useState } from 'react';

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const DropdownOnToggleEffect = ({
  onDropdownClose,
  onDropdownOpen,
}: {
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const isDropdownOpen = useRecoilComponentValueV2(
    isDropdownOpenComponentState,
  );

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

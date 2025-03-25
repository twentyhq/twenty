import { useEffect, useState } from 'react';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const DropdownOnToggleEffect = ({
  onDropdownClose,
  onDropdownOpen,
}: {
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const { isDropdownOpen } = useDropdown();
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

import { useEffect } from 'react';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const DropdownOnToggleEffect = ({
  onDropdownClose,
  onDropdownOpen,
}: {
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const { isDropdownOpen } = useDropdown();

  useEffect(() => {
    if (isDropdownOpen) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
    }
  }, [isDropdownOpen, onDropdownClose, onDropdownOpen]);

  return null;
};

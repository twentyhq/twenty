import { useEffect } from 'react';

import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';

export const DropdownToggleEffect = ({
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

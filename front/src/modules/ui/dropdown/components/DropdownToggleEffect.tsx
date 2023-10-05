import { useEffect } from 'react';

import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';

export const DropdownToggleEffect = ({
  dropdownId,
  onDropdownClose,
  onDropdownOpen,
}: {
  dropdownId: string;
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const { isDropdownOpen } = useDropdown({ dropdownId });

  useEffect(() => {
    if (isDropdownOpen) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
    }
  }, [isDropdownOpen, onDropdownClose, onDropdownOpen]);

  return null;
};

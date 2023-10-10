import { useEffect } from 'react';

import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';

export const DropdownToggleEffect = ({
  dropdownScopeId,
  onDropdownClose,
  onDropdownOpen,
}: {
  dropdownScopeId: string;
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const { isDropdownOpen } = useDropdown({ dropdownScopeId });

  useEffect(() => {
    if (isDropdownOpen) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
    }
  }, [isDropdownOpen, onDropdownClose, onDropdownOpen]);

  return null;
};

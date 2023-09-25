import { useEffect } from 'react';

import { useDropdownButton } from '../hooks/useDropdownButton';

export const DropdownToggleEffect = ({
  dropdownId,
  onDropdownClose,
  onDropdownOpen,
}: {
  dropdownId: string;
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const { isDropdownButtonOpen } = useDropdownButton({ dropdownId });

  useEffect(() => {
    if (isDropdownButtonOpen) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
    }
  }, [isDropdownButtonOpen, onDropdownClose, onDropdownOpen]);

  return null;
};

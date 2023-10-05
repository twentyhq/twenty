import { useEffect } from 'react';

import { useViewBarDropdownButton } from '../../view-bar/hooks/useViewBarDropdownButton';

export const DropdownToggleEffect = ({
  dropdownId,
  onDropdownClose,
  onDropdownOpen,
}: {
  dropdownId: string;
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
}) => {
  const { isDropdownOpen } = useViewBarDropdownButton({ dropdownId });

  useEffect(() => {
    if (isDropdownOpen) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
    }
  }, [isDropdownOpen, onDropdownClose, onDropdownOpen]);

  return null;
};

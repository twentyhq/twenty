import { useEffect } from 'react';

import { useDropdownButton } from '../hooks/useDropdownButton';

export const DropdownCloseEffect = ({
  dropdownId,
  onDropdownClose,
}: {
  dropdownId: string;
  onDropdownClose: () => void;
}) => {
  const { isDropdownButtonOpen } = useDropdownButton({ dropdownId });

  useEffect(() => {
    if (!isDropdownButtonOpen) {
      onDropdownClose();
    }
  }, [isDropdownButtonOpen]);

  return null;
};

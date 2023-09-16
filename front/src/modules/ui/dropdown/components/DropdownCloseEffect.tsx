import { useEffect } from 'react';

import { useDropdownButton } from '../hooks/useDropdownButton';

export const DropDownCloseEffect = ({
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
  }, [isDropdownButtonOpen, onDropdownClose]);

  return null;
};

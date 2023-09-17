import { useEffect } from 'react';

import { useDropdownButton } from './useDropdownButton';

export const UseDropdownCloseEffect = ({
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
};

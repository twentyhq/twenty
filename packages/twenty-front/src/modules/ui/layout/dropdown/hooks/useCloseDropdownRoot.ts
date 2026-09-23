import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { DropdownRootContext } from '@/ui/layout/dropdown/contexts/DropdownRootContext';

export const useCloseDropdownRoot = () => {
  const dropdownRootContext = useContext(DropdownRootContext);

  if (!isDefined(dropdownRootContext)) {
    throw new Error('useCloseDropdownRoot must be used within DropdownRoot');
  }

  return { closeDropdown: dropdownRootContext.closeDropdown };
};

import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { DropdownRootContext } from '@/ui/layout/dropdown/contexts/DropdownRootContext';

export const useIsDropdownRootOpen = () => {
  const dropdownRootContext = useContext(DropdownRootContext);

  if (!isDefined(dropdownRootContext)) {
    throw new Error('useIsDropdownRootOpen must be used within DropdownRoot');
  }

  return dropdownRootContext.isOpen;
};

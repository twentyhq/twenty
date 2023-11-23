import { useEffect } from 'react';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const MultipleFiltersDropdownFilterOnFilterChangedEffect = ({
  filterDefinitionUsedInDropdownType,
}: {
  filterDefinitionUsedInDropdownType: string | undefined;
}) => {
  const { setDropdownWidth } = useDropdown();

  useEffect(() => {
    switch (filterDefinitionUsedInDropdownType) {
      case 'DATE_TIME':
        setDropdownWidth(280);
        break;
      default:
        setDropdownWidth(160);
    }
  }, [filterDefinitionUsedInDropdownType, setDropdownWidth]);

  return null;
};

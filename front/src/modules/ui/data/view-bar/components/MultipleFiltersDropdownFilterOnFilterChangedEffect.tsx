import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { dropdownWidthState } from '@/ui/layout/dropdown/states/dropdownWidthState';

export const MultipleFiltersDropdownFilterOnFilterChangedEffect = ({
  filterDefinitionUsedInDropdownType,
}: {
  filterDefinitionUsedInDropdownType: string | undefined;
}) => {
  const [, setDropdownWidth] = useRecoilState(dropdownWidthState);

  useEffect(() => {
    switch (filterDefinitionUsedInDropdownType) {
      case 'date':
        setDropdownWidth(280);
        break;
      default:
        setDropdownWidth(160);
    }
  }, [filterDefinitionUsedInDropdownType, setDropdownWidth]);

  return null;
};

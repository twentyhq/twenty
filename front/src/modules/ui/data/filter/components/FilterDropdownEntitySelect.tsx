import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { useFilter } from '../hooks/useFilter';

export const FilterDropdownEntitySelect = () => {
  const { filterDefinitionUsedInDropdown } = useFilter();

  if (filterDefinitionUsedInDropdown?.type !== 'entity') {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <RecoilScope>
        {filterDefinitionUsedInDropdown.entitySelectComponent}
      </RecoilScope>
    </>
  );
};

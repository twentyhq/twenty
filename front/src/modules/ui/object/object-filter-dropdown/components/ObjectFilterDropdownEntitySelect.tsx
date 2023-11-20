import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { useFilter } from '../hooks/useFilter';

export const ObjectFilterDropdownEntitySelect = () => {
  const { filterDefinitionUsedInDropdown } = useFilter();

  if (filterDefinitionUsedInDropdown?.type !== 'ENTITY') {
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

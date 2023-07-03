import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { DropdownMenuSeparator } from '../../menu/DropdownMenuSeparator';

export function FilterDropdownEntitySelect() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  if (tableFilterDefinitionUsedInDropdown?.type !== 'entity') {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <RecoilScope>
        {tableFilterDefinitionUsedInDropdown.entitySelectComponent}
      </RecoilScope>
    </>
  );
}

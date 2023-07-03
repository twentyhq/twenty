import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { DropdownMenuSeparator } from '../../menu/DropdownMenuSeparator';

export function FilterDropdownEntitySelect() {
  const [selectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  if (selectedFilterInDropdown?.type !== 'entity') {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <RecoilScope>
        {selectedFilterInDropdown.searchSelectComponent}
      </RecoilScope>
    </>
  );
}

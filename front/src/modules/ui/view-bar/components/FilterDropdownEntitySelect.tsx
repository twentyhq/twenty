import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';

export function FilterDropdownEntitySelect() {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  if (filterDefinitionUsedInDropdown?.type !== 'entity') {
    return null;
  }

  return (
    <>
      <StyledDropdownMenuSeparator />
      <RecoilScope>
        {filterDefinitionUsedInDropdown.entitySelectComponent}
      </RecoilScope>
    </>
  );
}

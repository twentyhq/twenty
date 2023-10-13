import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityFilterDropdownButton } from './SingleEntityFilterDropdownButton';

type FilterDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const FilterDropdownButton = ({
  hotkeyScope,
}: FilterDropdownButtonProps) => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    ViewBarRecoilScopeContext,
  );

  const hasOnlyOneEntityFilter =
    availableFilters.length === 1 && availableFilters[0].type === 'entity';

  if (!availableFilters.length) {
    return <></>;
  }

  return hasOnlyOneEntityFilter ? (
    <SingleEntityFilterDropdownButton hotkeyScope={hotkeyScope} />
  ) : (
    <MultipleFiltersDropdownButton hotkeyScope={hotkeyScope} />
  );
};

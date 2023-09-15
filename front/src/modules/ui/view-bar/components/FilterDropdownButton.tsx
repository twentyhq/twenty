import { Context } from 'react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { availableFiltersScopedState } from '../states/availableFiltersScopedState';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityFilterDropdownButton } from './SingleEntityFilterDropdownButton';

type FilterDropdownButtonProps = {
  context: Context<string | null>;
  hotkeyScope: HotkeyScope;
};

export const FilterDropdownButton = ({
  hotkeyScope,
  context,
}: FilterDropdownButtonProps) => {
  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    context,
  );

  const hasOnlyOneEntityFilter =
    availableFilters.length === 1 && availableFilters[0].type === 'entity';

  if (!availableFilters.length) {
    return <></>;
  }

  return hasOnlyOneEntityFilter ? (
    <SingleEntityFilterDropdownButton
      context={context}
      hotkeyScope={hotkeyScope}
    />
  ) : (
    <MultipleFiltersDropdownButton
      context={context}
      hotkeyScope={hotkeyScope}
    />
  );
};

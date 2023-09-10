import { Context } from 'react';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityFilterDropdownButton } from './SingleEntityFilterDropdownButton';

type FilterDropdownButtonProps = {
  context: Context<string | null>;
  hotkeyScope: FiltersHotkeyScope;
  isPrimaryButton?: boolean;
  Icon?: IconComponent;
  color?: string;
  label?: string;
};

export function FilterDropdownButton({
  context,
  hotkeyScope,
  isPrimaryButton = false,
  color,
  Icon,
  label,
}: FilterDropdownButtonProps) {
  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    context,
  );

  const hasOnlyOneEntityFilter =
    availableFilters.length === 1 && availableFilters[0].type === 'entity';

  return hasOnlyOneEntityFilter ? (
    <SingleEntityFilterDropdownButton
      context={context}
      hotkeyScope={hotkeyScope}
    />
  ) : (
    <MultipleFiltersDropdownButton
      context={context}
      hotkeyScope={hotkeyScope}
      Icon={Icon}
      isPrimaryButton={isPrimaryButton}
      color={color}
      label={label}
    />
  );
}

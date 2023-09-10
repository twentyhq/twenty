import { Context } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityFilterDropdownButton } from './SingleEntityFilterDropdownButton';

export function FilterDropdownButton({
  context,
  hotkeyScope,
  isPrimaryButton = false,
  color,
  icon,
  label,
}: {
  context: Context<string | null>;
  hotkeyScope: FiltersHotkeyScope;
  isPrimaryButton?: boolean;
  icon?: React.ReactNode;
  color?: string;
  label?: string;
}) {
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
      icon={icon}
      isPrimaryButton={isPrimaryButton}
      color={color}
      label={label}
    />
  );
}

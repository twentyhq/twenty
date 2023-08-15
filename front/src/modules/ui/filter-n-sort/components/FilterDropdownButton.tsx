import { Context } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityFilterDropdownButton } from './SingleEntityFilterDropdownButton';

export function FilterDropdownButton({
  context,
  HotkeyScope,
  isPrimaryButton = false,
  color,
  icon,
  label,
}: {
  context: Context<string | null>;
  HotkeyScope: FiltersHotkeyScope;
  isPrimaryButton?: boolean;
  icon?: React.ReactNode;
  color?: string;
  label?: string;
}) {
  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    context,
  );
  return availableFilters.length === 1 &&
    availableFilters[0].type === 'entity' ? (
    <SingleEntityFilterDropdownButton
      context={context}
      HotkeyScope={HotkeyScope}
    />
  ) : (
    <MultipleFiltersDropdownButton
      context={context}
      HotkeyScope={HotkeyScope}
      icon={icon}
      isPrimaryButton={isPrimaryButton}
      color={color}
      label={label}
    />
  );
}

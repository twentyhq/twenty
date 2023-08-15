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
  label,
}: {
  context: Context<string | null>;
  HotkeyScope: FiltersHotkeyScope;
  isPrimaryButton?: boolean;
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
      isPrimaryButton={isPrimaryButton}
      color={color}
      label={label}
    />
  );
}

import { ComponentType, Context } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityFilterDropdownButton } from './SingleEntityFilterDropdownButton';

type Props<T> = {
  context: Context<string | null>;
  HotkeyScope: FiltersHotkeyScope;
  isPrimaryButton?: boolean;
  Icon?: ComponentType<T>;
  iconProps?: T;
  color?: string;
  label?: string;
};

export function FilterDropdownButton<T extends Record<string, unknown>>({
  context,
  HotkeyScope,
  isPrimaryButton = false,
  color,
  Icon,
  iconProps,
  label,
}: Props<T>) {
  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    context,
  );

  const hasOnlyOneEntityFilter =
    availableFilters.length === 1 && availableFilters[0].type === 'entity';

  return hasOnlyOneEntityFilter ? (
    <SingleEntityFilterDropdownButton
      context={context}
      HotkeyScope={HotkeyScope}
    />
  ) : (
    <MultipleFiltersDropdownButton
      context={context}
      HotkeyScope={HotkeyScope}
      Icon={Icon}
      iconProps={iconProps}
      isPrimaryButton={isPrimaryButton}
      color={color}
      label={label}
    />
  );
}

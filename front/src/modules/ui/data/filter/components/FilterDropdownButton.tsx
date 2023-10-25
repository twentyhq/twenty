import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useFilter } from '../hooks/useFilter';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityFilterDropdownButton } from './SingleEntityFilterDropdownButton';

type FilterDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const FilterDropdownButton = ({
  hotkeyScope,
}: FilterDropdownButtonProps) => {
  const { availableFilters } = useFilter();

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

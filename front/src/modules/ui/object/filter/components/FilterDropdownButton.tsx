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
  const { availableFilterDefinitions } = useFilter();

  const hasOnlyOneEntityFilter =
    availableFilterDefinitions.length === 1 &&
    availableFilterDefinitions[0].type === 'entity';

  if (!availableFilterDefinitions.length) {
    return <></>;
  }

  return hasOnlyOneEntityFilter ? (
    <SingleEntityFilterDropdownButton hotkeyScope={hotkeyScope} />
  ) : (
    <MultipleFiltersDropdownButton hotkeyScope={hotkeyScope} />
  );
};

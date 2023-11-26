import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useFilter } from '../hooks/useFilter';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityObjectFilterDropdownButton } from './SingleEntityObjectFilterDropdownButton';

type ObjectFilterDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const ObjectFilterDropdownButton = ({
  hotkeyScope,
}: ObjectFilterDropdownButtonProps) => {
  const { availableFilterDefinitions } = useFilter();

  const hasOnlyOneEntityFilter =
    availableFilterDefinitions.length === 1 &&
    availableFilterDefinitions[0].type === 'RELATION';

  if (!availableFilterDefinitions.length) {
    return <></>;
  }

  return hasOnlyOneEntityFilter ? (
    <SingleEntityObjectFilterDropdownButton hotkeyScope={hotkeyScope} />
  ) : (
    <MultipleFiltersDropdownButton hotkeyScope={hotkeyScope} />
  );
};

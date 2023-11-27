import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';
import { ObjectFilterDropdownScope } from '@/ui/object/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityObjectFilterDropdownButton } from './SingleEntityObjectFilterDropdownButton';

type ObjectFilterDropdownButtonProps = {
  filterId: string;
  onFilterSelect?: ((filter: Filter) => void) | undefined;
  hotkeyScope: HotkeyScope;
};

export const ObjectFilterDropdownButton = ({
  filterId,
  onFilterSelect,
  hotkeyScope,
}: ObjectFilterDropdownButtonProps) => {
  const { availableFilterDefinitions } = useFilter({
    filterScopeId: filterId,
  });
  const hasOnlyOneEntityFilter =
    availableFilterDefinitions.length === 1 &&
    availableFilterDefinitions[0].type === 'RELATION';

  if (!availableFilterDefinitions.length) {
    return <></>;
  }

  return (
    <ObjectFilterDropdownScope
      filterScopeId={filterId}
      onFilterSelect={onFilterSelect}
    >
      {hasOnlyOneEntityFilter ? (
        <SingleEntityObjectFilterDropdownButton hotkeyScope={hotkeyScope} />
      ) : (
        <MultipleFiltersDropdownButton hotkeyScope={hotkeyScope} />
      )}
    </ObjectFilterDropdownScope>
  );
};

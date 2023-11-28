import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';
import { ObjectFilterDropdownScope } from '@/ui/object/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityObjectFilterDropdownButton } from './SingleEntityObjectFilterDropdownButton';

type ObjectFilterDropdownButtonProps = {
  filterId: string;
  hotkeyScope: HotkeyScope;
};

export const ObjectFilterDropdownButton = ({
  filterId,
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
    <ObjectFilterDropdownScope filterScopeId={filterId}>
      {hasOnlyOneEntityFilter ? (
        <SingleEntityObjectFilterDropdownButton hotkeyScope={hotkeyScope} />
      ) : (
        <MultipleFiltersDropdownButton hotkeyScope={hotkeyScope} />
      )}
    </ObjectFilterDropdownScope>
  );
};

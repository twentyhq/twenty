import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { MultipleFiltersDropdownButton } from './MultipleFiltersDropdownButton';
import { SingleEntityObjectFilterDropdownButton } from './SingleEntityObjectFilterDropdownButton';

type ObjectFilterDropdownButtonProps = {
  filterDropdownId: string;
  hotkeyScope: HotkeyScope;
};

export const ObjectFilterDropdownButton = ({
  filterDropdownId,
  hotkeyScope,
}: ObjectFilterDropdownButtonProps) => {
  const { availableFilterDefinitionsState } = useFilterDropdown({
    filterDropdownId: filterDropdownId,
  });

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );

  const hasOnlyOneEntityFilter =
    availableFilterDefinitions.length === 1 &&
    availableFilterDefinitions[0].type === 'RELATION';

  if (!availableFilterDefinitions.length) {
    return <></>;
  }

  return (
    <ObjectFilterDropdownScope filterScopeId={filterDropdownId}>
      {hasOnlyOneEntityFilter ? (
        <SingleEntityObjectFilterDropdownButton hotkeyScope={hotkeyScope} />
      ) : (
        <MultipleFiltersDropdownButton hotkeyScope={hotkeyScope} />
      )}
    </ObjectFilterDropdownScope>
  );
};

import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useRecoilInstanceValue } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceValue';
import { availableFilterDefinitionsInstanceState } from '@/views/states/availableFilterDefinitionsInstanceState';
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
  const availableFilterDefinitions = useRecoilInstanceValue(
    availableFilterDefinitionsInstanceState,
    filterDropdownId,
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

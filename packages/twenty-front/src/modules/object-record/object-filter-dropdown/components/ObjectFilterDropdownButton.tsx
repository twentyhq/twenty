import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
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
  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
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

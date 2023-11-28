import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useFilterDropdown } from '@/ui/object/object-filter-dropdown/hooks/useFilterDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const MultipleFiltersDropdownButton = ({
  hotkeyScope,
}: MultipleFiltersDropdownButtonProps) => {
  const { resetFilter } = useFilterDropdown();

  return (
    <DropdownScope dropdownScopeId={ObjectFilterDropdownId}>
      <Dropdown
        onClose={resetFilter}
        clickableComponent={<MultipleFiltersButton />}
        dropdownComponents={<MultipleFiltersDropdownContent />}
        dropdownHotkeyScope={hotkeyScope}
        dropdownOffset={{ y: 8 }}
      />
    </DropdownScope>
  );
};

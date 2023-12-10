import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
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

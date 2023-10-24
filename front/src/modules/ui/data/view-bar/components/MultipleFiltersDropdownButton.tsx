import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { FilterDropdownId } from '../constants/FilterDropdownId';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const MultipleFiltersDropdownButton = ({
  hotkeyScope,
}: MultipleFiltersDropdownButtonProps) => {
  return (
    <DropdownScope dropdownScopeId={FilterDropdownId}>
      <Dropdown
        clickableComponent={<MultipleFiltersButton />}
        dropdownComponents={<MultipleFiltersDropdownContent />}
        dropdownHotkeyScope={hotkeyScope}
        dropdownOffset={{ y: 8 }}
      />
    </DropdownScope>
  );
};

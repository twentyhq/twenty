import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { FilterDropdownId } from '../constants/FilterDropdownId';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';
import { ViewBarDropdownButton } from './ViewBarDropdownButton';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const MultipleFiltersDropdownButton = ({
  hotkeyScope,
}: MultipleFiltersDropdownButtonProps) => {
  return (
    <ViewBarDropdownButton
      dropdownId={FilterDropdownId}
      buttonComponent={<MultipleFiltersButton />}
      dropdownComponents={<MultipleFiltersDropdownContent />}
      dropdownHotkeyScope={hotkeyScope}
    />
  );
};

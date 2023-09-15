import { Context } from 'react';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { FilterDropdownId } from '../constants/FilterDropdownId';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  context: Context<string | null>;
  hotkeyScope: HotkeyScope;
};

export function MultipleFiltersDropdownButton({
  context,
  hotkeyScope,
}: MultipleFiltersDropdownButtonProps) {
  return (
    <DropdownButton
      dropdownId={FilterDropdownId}
      buttonComponents={<MultipleFiltersButton context={context} />}
      dropdownComponents={<MultipleFiltersDropdownContent context={context} />}
      dropdownHotkeyScope={hotkeyScope}
    />
  );
}

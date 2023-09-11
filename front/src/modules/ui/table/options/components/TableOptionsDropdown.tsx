import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { TableOptionsDropdownKey } from '../../types/TableOptionsDropdownKey';

import { TableOptionsDropdownButton } from './TableOptionsDropdownButton';
import { TableOptionsDropdownContent } from './TableOptionsDropdownContent';

type TableOptionsDropdownProps = {
  onImport?: () => void;
  customHotkeyScope: HotkeyScope;
};

export function TableOptionsDropdown({
  onImport,
  customHotkeyScope,
}: TableOptionsDropdownProps) {
  return (
    <DropdownButton
      buttonComponents={<TableOptionsDropdownButton />}
      dropdownHotkeyScope={customHotkeyScope}
      dropdownKey={TableOptionsDropdownKey}
      dropdownComponents={<TableOptionsDropdownContent onImport={onImport} />}
    />
  );
}

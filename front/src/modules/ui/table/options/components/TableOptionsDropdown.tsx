import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';

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
      dropdownId={TableOptionsDropdownId}
      dropdownComponents={<TableOptionsDropdownContent onImport={onImport} />}
    />
  );
}

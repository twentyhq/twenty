import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useView } from '@/views/hooks/useView';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';

import { TableOptionsDropdownButton } from './TableOptionsDropdownButton';
import { TableOptionsDropdownContent } from './TableOptionsDropdownContent';

type TableOptionsDropdownProps = {
  customHotkeyScope: HotkeyScope;
};

export const TableOptionsDropdown = ({
  customHotkeyScope,
}: TableOptionsDropdownProps) => {
  const { setViewEditMode } = useView();

  return (
    <DropdownScope dropdownScopeId={TableOptionsDropdownId}>
      <Dropdown
        clickableComponent={<TableOptionsDropdownButton />}
        dropdownHotkeyScope={customHotkeyScope}
        dropdownOffset={{ y: 8 }}
        dropdownComponents={<TableOptionsDropdownContent />}
        onClickOutside={() => setViewEditMode('none')}
      />
    </DropdownScope>
  );
};

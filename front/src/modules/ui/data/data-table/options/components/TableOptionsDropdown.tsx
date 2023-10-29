import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useView } from '@/views/hooks/useView';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

import { TableOptionsDropdownButton } from './TableOptionsDropdownButton';
import { TableOptionsDropdownContent } from './TableOptionsDropdownContent';

export const TableOptionsDropdown = ({
  onImport,
}: {
  onImport?: () => void;
}) => {
  const { setViewEditMode } = useView();

  return (
    <DropdownScope dropdownScopeId={TableOptionsDropdownId}>
      <Dropdown
        clickableComponent={<TableOptionsDropdownButton />}
        dropdownHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
        dropdownOffset={{ y: 8 }}
        dropdownComponents={<TableOptionsDropdownContent onImport={onImport} />}
        onClickOutside={() => setViewEditMode('none')}
      />
    </DropdownScope>
  );
};

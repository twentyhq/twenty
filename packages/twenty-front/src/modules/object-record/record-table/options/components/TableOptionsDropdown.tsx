import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useViewBar } from '@/views/hooks/useViewBar';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

import { TableOptionsDropdownButton } from './TableOptionsDropdownButton';
import { TableOptionsDropdownContent } from './TableOptionsDropdownContent';

export const TableOptionsDropdown = ({
  onImport,
  recordTableId,
}: {
  onImport?: () => void;
  recordTableId: string;
}) => {
  const { setViewEditMode } = useViewBar();

  return (
    <Dropdown
      dropdownId={TableOptionsDropdownId}
      clickableComponent={<TableOptionsDropdownButton />}
      dropdownHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      dropdownOffset={{ y: 8 }}
      dropdownComponents={
        <TableOptionsDropdownContent
          onImport={onImport}
          recordTableId={recordTableId}
        />
      }
      onClickOutside={() => setViewEditMode('none')}
    />
  );
};

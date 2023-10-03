import { useResetRecoilState } from 'recoil';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';

import { TableOptionsDropdownButton } from './TableOptionsDropdownButton';
import { TableOptionsDropdownContent } from './TableOptionsDropdownContent';

type TableOptionsDropdownProps = {
  customHotkeyScope: HotkeyScope;
};

export const TableOptionsDropdown = ({
  customHotkeyScope,
}: TableOptionsDropdownProps) => {
  const resetViewEditMode = useResetRecoilState(viewEditModeState);

  return (
    <DropdownButton
      buttonComponents={<TableOptionsDropdownButton />}
      dropdownHotkeyScope={customHotkeyScope}
      dropdownId={TableOptionsDropdownId}
      dropdownComponents={<TableOptionsDropdownContent />}
      onClickOutside={resetViewEditMode}
    />
  );
};

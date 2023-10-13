import { useResetRecoilState } from 'recoil';

import { ViewBarDropdownButton } from '@/ui/Data/View Bar/components/ViewBarDropdownButton';
import { viewEditModeState } from '@/ui/Data/View Bar/states/viewEditModeState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

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
    <ViewBarDropdownButton
      buttonComponent={<TableOptionsDropdownButton />}
      dropdownHotkeyScope={customHotkeyScope}
      dropdownId={TableOptionsDropdownId}
      dropdownComponents={<TableOptionsDropdownContent />}
      onClickOutside={resetViewEditMode}
    />
  );
};

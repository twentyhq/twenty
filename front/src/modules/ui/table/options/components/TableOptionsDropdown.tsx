import { useRecoilState, useResetRecoilState } from 'recoil';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';
import { isDraggingAndSelectingState } from '../../states/isDraggingAndSelectingState';

import { TableOptionsDropdownButton } from './TableOptionsDropdownButton';
import { TableOptionsDropdownContent } from './TableOptionsDropdownContent';

type TableOptionsDropdownProps = {
  customHotkeyScope: HotkeyScope;
};

export const TableOptionsDropdown = ({
  customHotkeyScope,
}: TableOptionsDropdownProps) => {
  const resetViewEditMode = useResetRecoilState(viewEditModeState);

  const [, setIsDraggingAndSelecting] = useRecoilState(
    isDraggingAndSelectingState,
  );

  const handleClose = () => setIsDraggingAndSelecting(true);

  const handleOpen = () => setIsDraggingAndSelecting(false);

  return (
    <DropdownButton
      buttonComponents={<TableOptionsDropdownButton />}
      dropdownHotkeyScope={customHotkeyScope}
      dropdownId={TableOptionsDropdownId}
      dropdownComponents={<TableOptionsDropdownContent />}
      onClickOutside={resetViewEditMode}
      onClose={handleClose}
      onOpen={handleOpen}
    />
  );
};

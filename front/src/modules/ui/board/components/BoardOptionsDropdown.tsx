import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import type { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

import { BoardOptionsDropdownButton } from './BoardOptionsDropdownButton';
import { BoardOptionsDropdownContent } from './BoardOptionsDropdownContent';

type BoardOptionsDropdownProps = {
  customHotkeyScope: HotkeyScope;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
};

export function BoardOptionsDropdown({
  customHotkeyScope,
  onStageAdd,
}: BoardOptionsDropdownProps) {
  return (
    <DropdownButton
      buttonComponents={<BoardOptionsDropdownButton />}
      dropdownComponents={
        <BoardOptionsDropdownContent
          customHotkeyScope={customHotkeyScope}
          onStageAdd={onStageAdd}
        />
      }
      dropdownHotkeyScope={customHotkeyScope}
      dropdownKey={BoardOptionsDropdownKey}
    />
  );
}

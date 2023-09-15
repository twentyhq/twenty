import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';

import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

import { BoardOptionsDropdownButton } from './BoardOptionsDropdownButton';
import {
  BoardOptionsDropdownContent,
  type BoardOptionsDropdownContentProps,
} from './BoardOptionsDropdownContent';

type BoardOptionsDropdownProps = Pick<
  BoardOptionsDropdownContentProps,
  'customHotkeyScope' | 'onStageAdd' | 'scopeContext'
>;

export function BoardOptionsDropdown({
  customHotkeyScope,
  onStageAdd,
  scopeContext,
}: BoardOptionsDropdownProps) {
  return (
    <DropdownButton
      buttonComponents={<BoardOptionsDropdownButton />}
      dropdownComponents={
        <BoardOptionsDropdownContent
          customHotkeyScope={customHotkeyScope}
          onStageAdd={onStageAdd}
          scopeContext={scopeContext}
        />
      }
      dropdownHotkeyScope={customHotkeyScope}
      dropdownId={BoardOptionsDropdownKey}
    />
  );
}

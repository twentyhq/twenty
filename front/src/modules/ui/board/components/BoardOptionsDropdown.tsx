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
  ...props
}: BoardOptionsDropdownProps) {
  return (
    <DropdownButton
      buttonComponents={<BoardOptionsDropdownButton />}
      dropdownComponents={
        <BoardOptionsDropdownContent
          {...props}
          customHotkeyScope={customHotkeyScope}
        />
      }
      dropdownHotkeyScope={customHotkeyScope}
      dropdownKey={BoardOptionsDropdownKey}
    />
  );
}

import { useResetRecoilState } from 'recoil';

import { ViewBarDropdownButton } from '@/ui/view-bar/components/ViewBarDropdownButton';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';

import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

import { BoardOptionsDropdownButton } from './BoardOptionsDropdownButton';
import {
  BoardOptionsDropdownContent,
  BoardOptionsDropdownContentProps,
} from './BoardOptionsDropdownContent';

type BoardOptionsDropdownProps = Pick<
  BoardOptionsDropdownContentProps,
  'customHotkeyScope' | 'onStageAdd'
>;

export const BoardOptionsDropdown = ({
  customHotkeyScope,
  onStageAdd,
}: BoardOptionsDropdownProps) => {
  const resetViewEditMode = useResetRecoilState(viewEditModeState);

  return (
    <ViewBarDropdownButton
      buttonComponents={<BoardOptionsDropdownButton />}
      dropdownComponents={
        <BoardOptionsDropdownContent
          customHotkeyScope={customHotkeyScope}
          onStageAdd={onStageAdd}
        />
      }
      dropdownHotkeyScope={customHotkeyScope}
      dropdownId={BoardOptionsDropdownKey}
      onClickOutside={resetViewEditMode}
    />
  );
};

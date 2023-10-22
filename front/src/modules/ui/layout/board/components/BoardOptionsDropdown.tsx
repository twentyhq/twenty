import { useResetRecoilState } from 'recoil';

import { viewEditModeState } from '@/ui/data/view-bar/states/viewEditModeState';

import { Dropdown } from '../../dropdown/components/Dropdown';
import { DropdownScope } from '../../dropdown/scopes/DropdownScope';
import { BoardScopeIds } from '../types/enums/BoardScopeIds';

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
    <DropdownScope dropdownScopeId={BoardScopeIds.OptionsDropdown}>
      <Dropdown
        clickableComponent={<BoardOptionsDropdownButton />}
        dropdownComponents={
          <BoardOptionsDropdownContent
            customHotkeyScope={customHotkeyScope}
            onStageAdd={onStageAdd}
          />
        }
        dropdownHotkeyScope={customHotkeyScope}
        onClickOutside={resetViewEditMode}
        dropdownMenuWidth={170}
      />
    </DropdownScope>
  );
};

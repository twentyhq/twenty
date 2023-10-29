import { useView } from '@/views/hooks/useView';

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
  const { setViewEditMode } = useView();

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
        onClickOutside={() => setViewEditMode('none')}
        dropdownMenuWidth={170}
      />
    </DropdownScope>
  );
};

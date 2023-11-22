import { useView } from '@/views/hooks/useView';

import { Dropdown } from '../../../../layout/dropdown/components/Dropdown';
import { DropdownScope } from '../../../../layout/dropdown/scopes/DropdownScope';
import { BoardOptionsDropdownId } from '../../components/constants/BoardOptionsDropdownId';
import { BoardOptionsHotkeyScope } from '../../types/BoardOptionsHotkeyScope';

import { BoardOptionsDropdownButton } from './BoardOptionsDropdownButton';
import {
  BoardOptionsDropdownContent,
  BoardOptionsDropdownContentProps,
} from './BoardOptionsDropdownContent';

type BoardOptionsDropdownProps = Pick<
  BoardOptionsDropdownContentProps,
  'onStageAdd'
>;

export const BoardOptionsDropdown = ({
  onStageAdd,
}: BoardOptionsDropdownProps) => {
  const { setViewEditMode } = useView();

  return (
    <DropdownScope dropdownScopeId={BoardOptionsDropdownId}>
      <Dropdown
        clickableComponent={<BoardOptionsDropdownButton />}
        dropdownComponents={
          <BoardOptionsDropdownContent onStageAdd={onStageAdd} />
        }
        dropdownHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
        onClickOutside={() => setViewEditMode('none')}
        dropdownMenuWidth={170}
      />
    </DropdownScope>
  );
};

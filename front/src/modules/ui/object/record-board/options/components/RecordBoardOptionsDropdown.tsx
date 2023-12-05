import { useViewBar } from '@/views/hooks/useViewBar';

import { Dropdown } from '../../../../layout/dropdown/components/Dropdown';
import { DropdownScope } from '../../../../layout/dropdown/scopes/DropdownScope';
import { BoardOptionsDropdownId } from '../../components/constants/BoardOptionsDropdownId';
import { BoardOptionsHotkeyScope } from '../../types/BoardOptionsHotkeyScope';

import { RecordBoardOptionsDropdownButton } from './RecordBoardOptionsDropdownButton';
import {
  RecordBoardOptionsDropdownContent,
  RecordBoardOptionsDropdownContentProps,
} from './RecordBoardOptionsDropdownContent';

type RecordBoardOptionsDropdownProps = Pick<
  RecordBoardOptionsDropdownContentProps,
  'onStageAdd' | 'recordBoardId'
>;

export const RecordBoardOptionsDropdown = ({
  onStageAdd,
  recordBoardId,
}: RecordBoardOptionsDropdownProps) => {
  const { setViewEditMode } = useViewBar();

  return (
    <DropdownScope dropdownScopeId={BoardOptionsDropdownId}>
      <Dropdown
        clickableComponent={<RecordBoardOptionsDropdownButton />}
        dropdownComponents={
          <RecordBoardOptionsDropdownContent
            onStageAdd={onStageAdd}
            recordBoardId={recordBoardId}
          />
        }
        dropdownHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
        onClickOutside={() => setViewEditMode('none')}
        dropdownMenuWidth={170}
      />
    </DropdownScope>
  );
};

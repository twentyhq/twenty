import { BoardOptionsDropdownId } from '@/object-record/record-board/constants/BoardOptionsDropdownId';
import { useViewBar } from '@/views/hooks/useViewBar';

import { Dropdown } from '../../../../ui/layout/dropdown/components/Dropdown';
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
    <Dropdown
      dropdownId={BoardOptionsDropdownId}
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
  );
};

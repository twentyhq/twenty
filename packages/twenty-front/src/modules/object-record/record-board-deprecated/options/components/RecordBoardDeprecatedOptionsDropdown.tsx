import { BoardOptionsDropdownId } from '@/object-record/record-board-deprecated/constants/BoardOptionsDropdownId';
import { useViewBar } from '@/views/hooks/useViewBar';

import { Dropdown } from '../../../../ui/layout/dropdown/components/Dropdown';
import { BoardOptionsHotkeyScope } from '../../types/BoardOptionsHotkeyScope';

import { RecordBoardDeprecatedOptionsDropdownButton } from './RecordBoardDeprecatedOptionsDropdownButton';
import {
  RecordBoardDeprecatedOptionsDropdownContent,
  RecordBoardDeprecatedOptionsDropdownContentProps,
} from './RecordBoardDeprecatedOptionsDropdownContent';

type RecordBoardDeprecatedOptionsDropdownProps = Pick<
  RecordBoardDeprecatedOptionsDropdownContentProps,
  'onStageAdd' | 'recordBoardId'
>;

export const RecordBoardDeprecatedOptionsDropdown = ({
  onStageAdd,
  recordBoardId,
}: RecordBoardDeprecatedOptionsDropdownProps) => {
  const { setViewEditMode } = useViewBar();

  return (
    <Dropdown
      dropdownId={BoardOptionsDropdownId}
      clickableComponent={<RecordBoardDeprecatedOptionsDropdownButton />}
      dropdownComponents={
        <RecordBoardDeprecatedOptionsDropdownContent
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

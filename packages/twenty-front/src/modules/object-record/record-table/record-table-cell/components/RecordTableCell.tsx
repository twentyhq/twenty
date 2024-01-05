import { FieldDisplay } from '@/object-record/field/components/FieldDisplay';
import { FieldInput } from '@/object-record/field/components/FieldInput';
import { FieldInputEvent } from '@/object-record/field/types/FieldInputEvent';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useRecordTable } from '../../hooks/useRecordTable';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellContainer } from './RecordTableCellContainer';

export const RecordTableCell = ({
  customHotkeyScope,
}: {
  customHotkeyScope: HotkeyScope;
}) => {
  const { closeTableCell } = useTableCell();

  const { moveLeft, moveRight, moveDown } = useRecordTable();

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    closeTableCell();
    moveDown();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    persistField();
    closeTableCell();
  };

  const handleCancel = () => {
    closeTableCell();
  };

  const handleClickOutside: FieldInputEvent = (persistField) => {
    persistField();

    closeTableCell();
  };

  const handleEscape: FieldInputEvent = (persistField) => {
    persistField();
    closeTableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    persistField();
    closeTableCell();
    moveRight();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    persistField();
    closeTableCell();
    moveLeft();
  };

  return (
    <TableCellContainer
      editHotkeyScope={customHotkeyScope}
      editModeContent={
        <FieldInput
          onCancel={handleCancel}
          onClickOutside={handleClickOutside}
          onEnter={handleEnter}
          onEscape={handleEscape}
          onShiftTab={handleShiftTab}
          onSubmit={handleSubmit}
          onTab={handleTab}
        />
      }
      nonEditModeContent={<FieldDisplay />}
    ></TableCellContainer>
  );
};

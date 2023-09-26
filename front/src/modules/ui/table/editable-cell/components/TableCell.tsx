import { FieldDisplay } from '@/ui/field/components/FieldDisplay';
import { FieldInput, FieldInputEvent } from '@/ui/field/components/FieldInput';

import { useMoveSoftFocus } from '../../hooks/useMoveSoftFocus';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellContainer } from './TableCellContainer';

export const TableCell = () => {
  const { closeTableCell: closeEditableCell } = useTableCell();

  const { moveLeft, moveRight, moveDown } = useMoveSoftFocus();

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
    moveDown();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
  };

  const handleCancel = () => {
    closeEditableCell();
  };

  const handleEscape = () => {
    closeEditableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
    moveRight();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    persistField();
    closeEditableCell();
    moveLeft();
  };

  return (
    <TableCellContainer
      editModeContent={
        <FieldInput
          onCancel={handleCancel}
          onClickOutside={handleCancel}
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

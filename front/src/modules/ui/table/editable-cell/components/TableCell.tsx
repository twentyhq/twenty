import { FieldDisplay } from '@/ui/field/components/FieldDisplay';
import { FieldInput, FieldInputEvent } from '@/ui/field/components/FieldInput';

import { useMoveSoftFocus } from '../../hooks/useMoveSoftFocus';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellContainer } from './TableCellContainer';

export const TableCell = () => {
  const { closeTableCell } = useTableCell();

  const { moveLeft, moveRight, moveDown } = useMoveSoftFocus();

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

  const handleEscape = () => {
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

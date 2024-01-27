import { useContext } from 'react';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { ColumnIndexContext } from '@/object-record/record-table/contexts/ColumnIndexContext';
import { RowIdContext } from '@/object-record/record-table/contexts/RowIdContext';
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
  const rowId = useContext(RowIdContext);

  const { moveLeft, moveRight, moveDown } = useRecordTable();

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;

  const skipFieldPersist = isFirstColumnCell;

  const handleEnter: FieldInputEvent = (persistField) => {
    if (!skipFieldPersist) {
      persistField();
    }

    closeTableCell();
    moveDown();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    if (!skipFieldPersist) {
      persistField();
    }

    closeTableCell();
  };

  const handleCancel = () => {
    closeTableCell();
  };

  const handleClickOutside: FieldInputEvent = (persistField) => {
    if (!skipFieldPersist) {
      persistField();
    }

    closeTableCell();
  };

  const handleEscape: FieldInputEvent = (persistField) => {
    if (!skipFieldPersist) {
      persistField();
    }

    closeTableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    if (!skipFieldPersist) {
      persistField();
    }

    closeTableCell();
    moveRight();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    if (!skipFieldPersist) {
      persistField();
    }

    closeTableCell();
    moveLeft();
  };

  return (
    <TableCellContainer
      editHotkeyScope={customHotkeyScope}
      editModeContent={
        <FieldInput
          recordFieldInputdId={rowId ?? ''}
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
    />
  );
};

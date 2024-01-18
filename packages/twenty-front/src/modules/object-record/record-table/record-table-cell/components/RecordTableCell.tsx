import { useContext } from 'react';

import { FieldDisplay } from '@/object-record/field/components/FieldDisplay';
import { FieldInput } from '@/object-record/field/components/FieldInput';
import { useIsFieldEditModeValueEmpty } from '@/object-record/field/hooks/useIsFieldEditModeValueEmpty';
import { FieldInputEvent } from '@/object-record/field/types/FieldInputEvent';
import { ColumnIndexContext } from '@/object-record/record-table/contexts/ColumnIndexContext';
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

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;
  const isEditModeValueEmpty = useIsFieldEditModeValueEmpty();

  const skipFieldPersist = isFirstColumnCell && isEditModeValueEmpty;

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

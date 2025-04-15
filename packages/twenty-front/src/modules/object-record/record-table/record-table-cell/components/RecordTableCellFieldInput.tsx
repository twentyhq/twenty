import { FieldInput } from '@/object-record/record-field/components/FieldInput';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

export const RecordTableCellFieldInput = () => {
  const { onMoveFocus, onCloseTableCell } = useRecordTableBodyContextOrThrow();
  const { isReadOnly } = useContext(FieldContext);

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();

    onCloseTableCell();
    onMoveFocus('down');
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    persistField();

    onCloseTableCell();
  };

  const handleCancel = () => {
    onCloseTableCell();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = useRecoilCallback(
    ({ snapshot }) =>
      (persistField, event) => {
        const hotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();
        if (hotkeyScope.scope !== TableHotkeyScope.CellEditMode) {
          return;
        }
        event.stopImmediatePropagation();

        persistField();
        onCloseTableCell();
      },
    [onCloseTableCell],
  );

  const handleEscape: FieldInputEvent = (persistField) => {
    persistField();

    onCloseTableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    persistField();

    onCloseTableCell();
    onMoveFocus('right');
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    persistField();

    onCloseTableCell();
    onMoveFocus('left');
  };

  return (
    <FieldInput
      onCancel={handleCancel}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onSubmit={handleSubmit}
      onTab={handleTab}
      isReadOnly={isReadOnly}
    />
  );
};

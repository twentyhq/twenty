import { FieldInput } from '@/object-record/record-field/components/FieldInput';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

export const RecordTableCellFieldInput = () => {
  const { onMoveFocus, onCloseTableCell } = useRecordTableBodyContextOrThrow();
  const { isRecordFieldReadOnly: isReadOnly } = useContext(FieldContext);
  const instanceId = useAvailableComponentInstanceId(
    RecordFieldComponentInstanceContext,
  );

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
        const currentFocusId = snapshot
          .getLoadable(currentFocusIdSelector)
          .getValue();

        if (currentFocusId !== instanceId) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        persistField();
        onCloseTableCell();
      },
    [onCloseTableCell, instanceId],
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

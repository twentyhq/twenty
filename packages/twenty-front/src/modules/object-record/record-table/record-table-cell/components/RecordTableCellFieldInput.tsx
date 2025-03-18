import { useContext } from 'react';

import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useRecoilCallback } from 'recoil';

export const RecordTableCellFieldInput = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { onMoveFocus, onCloseTableCell } = useRecordTableBodyContextOrThrow();

  const isFieldReadOnly = useIsFieldValueReadOnly();

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

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      (persistField: () => void, event: MouseEvent | TouchEvent) => {
        const dropdownFocusId = getDropdownFocusIdForRecordField(
          recordId,
          fieldDefinition.fieldMetadataId,
          'table-cell',
        );

        const activeDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        if (activeDropdownFocusId !== dropdownFocusId) {
          return;
        }

        event.stopImmediatePropagation();

        persistField();

        onCloseTableCell();
      },
    [fieldDefinition, onCloseTableCell, recordId],
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
      recordFieldInputdId={getRecordFieldInputId(
        recordId,
        fieldDefinition?.metadata?.fieldName,
      )}
      onCancel={handleCancel}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onSubmit={handleSubmit}
      onTab={handleTab}
      isReadOnly={isFieldReadOnly}
    />
  );
};

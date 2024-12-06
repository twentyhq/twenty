import { useContext } from 'react';

import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useRecoilCallback } from 'recoil';

export const RecordTableCellFieldInput = () => {
  const { onUpsertRecord, onMoveFocus, onCloseTableCell } =
    useContext(RecordTableContext);

  const { recordId, fieldDefinition } = useContext(FieldContext);
  const isFieldReadOnly = useIsFieldValueReadOnly();

  const handleEnter: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('down');
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

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

        onUpsertRecord({
          persistField,
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
        });

        onCloseTableCell();
      },
    [fieldDefinition, onCloseTableCell, onUpsertRecord, recordId],
  );

  const handleEscape: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('right');
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

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

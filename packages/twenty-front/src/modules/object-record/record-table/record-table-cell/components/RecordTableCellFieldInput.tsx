import { useContext } from 'react';

import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

export const RecordTableCellFieldInput = () => {
  const { onUpsertRecord, onMoveFocus, onCloseTableCell } =
    useContext(RecordTableContext);
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const { isReadOnly } = useContext(RecordTableRowContext);

  const handleEnter: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('down');
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

  const handleCancel = () => {
    onCloseTableCell();
  };

  const handleClickOutside: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

  const handleEscape: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('right');
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('left');
  };

  return (
    <FieldInput
      recordFieldInputdId={`${entityId}-${fieldDefinition?.metadata?.fieldName}`}
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

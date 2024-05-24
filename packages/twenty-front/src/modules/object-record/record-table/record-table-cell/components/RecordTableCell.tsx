import { useContext } from 'react';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellContainer';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const RecordTableCell = ({
  customHotkeyScope,
}: {
  customHotkeyScope: HotkeyScope;
}) => {
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
    <FieldFocusContextProvider>
      <RecordTableCellContainer
        editHotkeyScope={customHotkeyScope}
        editModeContent={
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
        }
        nonEditModeContent={<FieldDisplay />}
      />
    </FieldFocusContextProvider>
  );
};

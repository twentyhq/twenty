import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordFieldInputStates } from '@/object-record/record-field/hooks/internal/useRecordFieldInputStates';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { useRecordTableMoveFocus } from '@/object-record/record-table/hooks/useRecordTableMoveFocus';
import { RecordTableCellContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellContainer';
import { useCloseRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useCloseRecordTableCell';
import { recordTablePendingRecordIdState } from '@/object-record/record-table/states/recordTablePendingRecordIdState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const RecordTableCell = ({
  customHotkeyScope,
}: {
  customHotkeyScope: HotkeyScope;
}) => {
  const { closeTableCell } = useCloseRecordTableCell();
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const recordTablePendingRecordId = useRecoilValue(
    recordTablePendingRecordIdState,
  );
  const fieldName = fieldDefinition.metadata.fieldName;
  const { getDraftValueSelector } = useRecordFieldInputStates(
    `${entityId}-${fieldName}`,
  );
  const draftValue = useRecoilValue(getDraftValueSelector());

  const objectNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular ?? '';
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
  });

  const upsertRecord = (persistField: () => void) => {
    if (recordTablePendingRecordId && draftValue) {
      createOneRecord({
        id: recordTablePendingRecordId,
        name: draftValue,
        position: 'first',
      });
    } else if (!recordTablePendingRecordId) {
      persistField();
    }
  };

  const { moveLeft, moveRight, moveDown } = useRecordTableMoveFocus();

  const handleEnter: FieldInputEvent = (persistField) => {
    upsertRecord(persistField);

    closeTableCell();
    moveDown();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    upsertRecord(persistField);

    closeTableCell();
  };

  const handleCancel = () => {
    closeTableCell();
  };

  const handleClickOutside: FieldInputEvent = (persistField) => {
    upsertRecord(persistField);

    closeTableCell();
  };

  const handleEscape: FieldInputEvent = (persistField) => {
    upsertRecord(persistField);

    closeTableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    upsertRecord(persistField);

    closeTableCell();
    moveRight();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    upsertRecord(persistField);

    closeTableCell();
    moveLeft();
  };

  return (
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
        />
      }
      nonEditModeContent={<FieldDisplay />}
    />
  );
};

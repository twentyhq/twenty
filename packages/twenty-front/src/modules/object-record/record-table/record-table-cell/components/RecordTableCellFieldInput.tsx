import { useContext } from 'react';

import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { useClickOustideListenerStates } from '@/ui/utilities/pointer-event/hooks/useClickOustideListenerStates';
import { useSetRecoilState } from 'recoil';

export const RecordTableCellFieldInput = () => {
  const { getClickOutsideListenerIsActivatedState } =
    useClickOustideListenerStates(RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID);
  const setClickOutsideListenerIsActivated = useSetRecoilState(
    getClickOutsideListenerIsActivatedState,
  );

  const { onUpsertRecord, onMoveFocus, onCloseTableCell } =
    useContext(RecordTableContext);

  const { recordId, fieldDefinition } = useContext(FieldContext);
  const isFieldReadOnly = useIsFieldValueReadOnly();

  const currentRecordGroupId = useCurrentRecordGroupId({
    allowUndefined: true,
  });

  const handleEnter: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      recordGroupId: currentRecordGroupId,
    });

    onCloseTableCell(currentRecordGroupId);
    onMoveFocus('down');
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      recordGroupId: currentRecordGroupId,
    });

    onCloseTableCell(currentRecordGroupId);
  };

  const handleCancel = () => {
    onCloseTableCell(currentRecordGroupId);
  };

  const handleClickOutside: FieldInputEvent = (persistField) => {
    setClickOutsideListenerIsActivated(false);

    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      recordGroupId: currentRecordGroupId,
    });

    onCloseTableCell(currentRecordGroupId);
  };

  const handleEscape: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      recordGroupId: currentRecordGroupId,
    });

    onCloseTableCell(currentRecordGroupId);
  };

  const handleTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      recordGroupId: currentRecordGroupId,
    });

    onCloseTableCell(currentRecordGroupId);
    onMoveFocus('right');
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      recordGroupId: currentRecordGroupId,
    });

    onCloseTableCell(currentRecordGroupId);
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

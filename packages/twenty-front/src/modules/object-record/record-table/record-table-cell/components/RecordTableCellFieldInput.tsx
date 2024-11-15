import { useContext } from 'react';

import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldReadOnly } from '@/object-record/record-field/hooks/useIsFieldReadOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
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
  const isFieldReadOnly = useIsFieldReadOnly();

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

  const handleClickOutside: FieldInputEvent = (persistField) => {
    setClickOutsideListenerIsActivated(false);

    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

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

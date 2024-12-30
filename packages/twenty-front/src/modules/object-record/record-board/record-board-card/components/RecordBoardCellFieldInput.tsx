import { useRecordBoardBodyContextOrThrow } from '@/object-record/record-board/contexts/RecordBoardBodyContext';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

export const RecordBoardCellFieldInput = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { onUpsertRecord, onCloseInlineCell } =
    useRecordBoardBodyContextOrThrow();
  const isFieldReadOnly = useIsFieldValueReadOnly();

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    onUpsertRecord({
      persistField,
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    });
    onCloseInlineCell();
  };
  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      (persistField: () => void, event: MouseEvent | TouchEvent) => {
        const dropdownFocusId = getDropdownFocusIdForRecordField(
          recordId,
          fieldDefinition.fieldMetadataId,
          'inline-cell',
        );

        const activeDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        if (
          activeDropdownFocusId !== null &&
          activeDropdownFocusId !== dropdownFocusId
        ) {
          return;
        }

        event.stopImmediatePropagation();

        onUpsertRecord({
          persistField,
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
        });

        onCloseInlineCell();
      },
    [fieldDefinition, onCloseInlineCell, onUpsertRecord, recordId],
  );

  return (
    <FieldInput
      recordFieldInputdId={getRecordFieldInputId(
        recordId,
        fieldDefinition?.metadata?.fieldName,
      )}
      onEnter={handleEnter}
      onClickOutside={handleClickOutside}
      onCancel={onCloseInlineCell}
      onSubmit={handleEnter}
      isReadOnly={isFieldReadOnly}
    />
  );
};

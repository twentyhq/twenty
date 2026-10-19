import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useEmailsField } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsField';
import { EmailsMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/EmailsMultiItemInput';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';

export const EmailsFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useEmailsField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: string[]) => {
    setRecordFieldInputIsFieldInError(hasError && values.length === 0);
  };

  return (
    <EmailsMultiItemInput
      value={draftValue}
      fieldName={fieldDefinition.metadata.fieldName}
      maxNumberOfValues={fieldDefinition.metadata.settings?.maxNumberOfValues}
      onChange={setDraftValue}
      onEnter={(newValue) => onEnter?.({ newValue })}
      onSubmit={(newValue) => onSubmit?.({ newValue, skipClose: true })}
      onEscape={(newValue) => onEscape?.({ newValue })}
      onClickOutside={(newValue, event) =>
        onClickOutside?.({ newValue, event })
      }
      onError={handleError}
    />
  );
};

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePhonesField } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesField';
import { PhonesMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/components/PhonesMultiItemInput';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const PhonesFieldInput = () => {
  const { fieldDefinition, setDraftValue, draftValue } = usePhonesField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: PhoneRecord[]) => {
    setRecordFieldInputIsFieldInError(hasError && values.length === 0);
  };

  return (
    <PhonesMultiItemInput
      value={draftValue}
      fieldName={fieldDefinition.metadata.fieldName}
      defaultCountry={stripSimpleQuotesFromString(
        fieldDefinition?.defaultValue?.primaryPhoneCountryCode,
      )}
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

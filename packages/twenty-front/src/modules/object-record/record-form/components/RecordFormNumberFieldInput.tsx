import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

type RecordFormNumberFieldInputProps = {
  field: Pick<
    FieldDefinition<FieldNumberMetadata>,
    'type' | 'label' | 'metadata'
  >;
  defaultValue?: number | null;
  onChange: (value: number | null) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormNumberFieldInput = ({
  field,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormNumberFieldInputProps) => {
  const numberType = field.metadata.settings?.type;
  const isPercentage = numberType === 'percentage';

  const [inputText, setInputText] = useState(() => {
    const draftValue = computeDraftValueFromFieldValue({
      fieldDefinition: field,
      fieldValue: defaultValue ?? null,
    });

    return isDefined(draftValue) ? String(draftValue) : '';
  });
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const handleChange = (newText: string) => {
    const numberText = isPercentage ? newText.replace(/%\s*$/, '') : newText;

    setInputText(numberText);

    const numberValueResult = getNumberValueToPersist({
      newValue: numberText.trim(),
      numberType,
    });

    if (!numberValueResult.success) {
      setErrorMessage(t`Invalid number`);
      return;
    }

    setErrorMessage(undefined);
    onChange(numberValueResult.value);
  };

  return (
    <RecordFormTextInput
      label={field.label}
      value={inputText}
      onChange={handleChange}
      readonly={readonly}
      placeholder={
        !isPercentage && isNonEmptyString(placeholder)
          ? placeholder
          : t`Enter a number`
      }
      suffix={isPercentage ? doNotTranslate('%') : undefined}
      error={errorMessage}
    />
  );
};

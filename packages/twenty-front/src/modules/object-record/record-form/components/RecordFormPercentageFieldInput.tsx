import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { RecordFormPickerFieldInput } from '@/object-record/record-form/components/RecordFormPickerFieldInput';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';

type RecordFormPercentageFieldInputProps = {
  field: Pick<
    FieldDefinition<FieldNumberMetadata>,
    'type' | 'label' | 'metadata'
  >;
  defaultValue?: number | null;
  onChange: (value: number | null) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormPercentageFieldInput = ({
  field,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormPercentageFieldInputProps) => {
  const draftText = String(
    computeDraftValueFromFieldValue({
      fieldDefinition: field,
      fieldValue: defaultValue ?? null,
    }),
  );
  const [inputText, setInputText] = useState(draftText);
  const [previousDraftText, setPreviousDraftText] = useState(draftText);
  const [error, setError] = useState<string | undefined>();

  if (previousDraftText !== draftText) {
    setPreviousDraftText(draftText);

    const percentageValueResult = getNumberValueToPersist({
      newValue: inputText.trim(),
      numberType: 'percentage',
    });

    if (
      !percentageValueResult.success ||
      percentageValueResult.value !== (defaultValue ?? null)
    ) {
      setInputText(draftText);
    }
  }

  const handleChange = (newText: string) => {
    const percentageText = newText.replace(/%\s*$/, '');
    setInputText(percentageText);

    const percentageValueResult = getNumberValueToPersist({
      newValue: percentageText.trim(),
      numberType: 'percentage',
    });

    if (!percentageValueResult.success) {
      setError(t`Invalid number`);
      return;
    }

    setError(undefined);
    onChange(percentageValueResult.value);
  };

  return (
    <RecordFormPickerFieldInput
      label={field.label}
      value={inputText}
      onChange={handleChange}
      readonly={readonly}
      placeholder={placeholder ?? t`Enter a number`}
      suffix={doNotTranslate('%')}
      error={error}
    />
  );
};

import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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
};

export const RecordFormPercentageFieldInput = ({
  field,
  defaultValue,
  onChange,
  readonly,
}: RecordFormPercentageFieldInputProps) => {
  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );
  const [inputText, setInputText] = useState(
    String(
      computeDraftValueFromFieldValue({
        fieldDefinition: field,
        fieldValue: defaultValue ?? null,
      }),
    ),
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const handleChange = (newText: string) => {
    const percentageText = newText.replace(/%\s*$/, '');

    setInputText(percentageText);

    const percentageValueResult = getNumberValueToPersist({
      newValue: percentageText.trim(),
      numberType: 'percentage',
    });

    if (!percentageValueResult.success) {
      setErrorMessage(t`Invalid number`);
      setRecordFieldInputIsFieldInError(true);
      return;
    }

    setErrorMessage(undefined);
    setRecordFieldInputIsFieldInError(false);
    onChange(percentageValueResult.value);
  };

  return (
    <RecordFormTextInput
      label={field.label}
      value={inputText}
      onChange={handleChange}
      readonly={readonly}
      placeholder={t`Enter a number`}
      suffix={doNotTranslate('%')}
      error={errorMessage}
    />
  );
};

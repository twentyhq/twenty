import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

type UseRecordFormPercentageInputProps = {
  field: Pick<FieldDefinition<FieldNumberMetadata>, 'type' | 'metadata'>;
  defaultValue?: number | null;
  onChange: (value: number | null) => void;
};

export const useRecordFormPercentageInput = ({
  field,
  defaultValue,
  onChange,
}: UseRecordFormPercentageInputProps) => {
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

  return { inputText, error, handleChange };
};

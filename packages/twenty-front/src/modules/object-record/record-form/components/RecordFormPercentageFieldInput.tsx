import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormPickerFieldInput } from '@/object-record/record-form/components/RecordFormPickerFieldInput';
import { useRecordFormPercentageInput } from '@/object-record/record-form/hooks/useRecordFormPercentageInput';
import { t } from '@lingui/core/macro';
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
  const { inputText, error, handleChange } = useRecordFormPercentageInput({
    field,
    defaultValue,
    onChange,
  });

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

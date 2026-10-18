import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormPickerFieldInput } from '@/object-record/record-form/components/RecordFormPickerFieldInput';
import { t } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isAbsoluteUrl } from 'twenty-shared/utils';

type RecordFormUrlFieldInputProps = {
  label?: string;
  defaultValue?: FieldLinksValue;
  onChange: (value: FieldLinksValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormUrlFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormUrlFieldInputProps) => {
  const url = defaultValue?.primaryLinkUrl ?? '';
  const protocol =
    url.match(/^https?:\/\//i)?.[0] ?? doNotTranslate('https://');
  const address = url.replace(/^https?:\/\//i, '');

  const handleChange = (newAddress: string) => {
    const trimmedAddress = newAddress.trim();
    onChange({
      primaryLinkLabel: defaultValue?.primaryLinkLabel ?? '',
      primaryLinkUrl:
        trimmedAddress === ''
          ? ''
          : isAbsoluteUrl(trimmedAddress)
            ? trimmedAddress
            : `${protocol}${trimmedAddress}`,
      secondaryLinks: defaultValue?.secondaryLinks ?? null,
    });
  };

  return (
    <RecordFormPickerFieldInput
      label={label}
      value={address}
      onChange={handleChange}
      readonly={readonly}
      placeholder={placeholder?.replace(/^https?:\/\//i, '') ?? t`URL`}
      prefix={protocol}
    />
  );
};

import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type FormFieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { t } from '@lingui/core/macro';
import { type FieldLinksVariant } from 'twenty-shared/types';

type RecordFormLinksFieldInputProps = {
  label?: string;
  defaultValue?: FormFieldLinksValue;
  onChange: (value: FormFieldLinksValue) => void;
  linksVariant?: FieldLinksVariant;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormLinksFieldInput = ({
  label,
  defaultValue,
  onChange,
  linksVariant,
  readonly,
  placeholder,
}: RecordFormLinksFieldInputProps) => {
  const handlePrimaryLinkUrlChange = (primaryLinkUrl: string) =>
    onChange({
      primaryLinkLabel: defaultValue?.primaryLinkLabel ?? '',
      primaryLinkUrl,
      secondaryLinks: defaultValue?.secondaryLinks ?? null,
    });

  return (
    <FormTextFieldInput
      label={label}
      defaultValue={defaultValue?.primaryLinkUrl}
      onChange={handlePrimaryLinkUrlChange}
      placeholder={
        placeholder ?? (linksVariant === 'domain' ? t`Domain` : t`URL`)
      }
      readonly={readonly}
    />
  );
};

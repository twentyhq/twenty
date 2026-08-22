import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldLinksDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import {
  type FieldArrayValue,
  type FormFieldLinksValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import { Field } from 'twenty-ui/input';

type FormLinksFieldInputProps = {
  label?: string;
  defaultValue?: FormFieldLinksValue;
  onChange: (value: FormFieldLinksValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
  maxNumberOfValues?: number | null;
};

export const FormLinksFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
  placeholder,
  maxNumberOfValues,
}: FormLinksFieldInputProps) => {
  const allowsSecondaryLinks = maxNumberOfValues !== 1;
  const secondaryLinks = defaultValue?.secondaryLinks;

  const maxSecondaryLinkCount = isDefined(maxNumberOfValues)
    ? maxNumberOfValues - 1
    : undefined;

  const handleChange =
    (field: keyof FieldLinksDraftValue) => (updatedLinksPart: string) => {
      const updatedLinks = {
        primaryLinkLabel: defaultValue?.primaryLinkLabel ?? '',
        primaryLinkUrl: defaultValue?.primaryLinkUrl ?? '',
        secondaryLinks: secondaryLinks ?? null,
        [field]: updatedLinksPart,
      };
      onChange(updatedLinks);
    };

  const secondaryLinkUrls = isStandaloneVariableString(secondaryLinks)
    ? secondaryLinks
    : (secondaryLinks ?? []).map((link) => link.url ?? '');

  const handleSecondaryLinksChange = (
    updatedUrls: FieldArrayValue | string,
  ) => {
    onChange({
      primaryLinkLabel: defaultValue?.primaryLinkLabel ?? '',
      primaryLinkUrl: defaultValue?.primaryLinkUrl ?? '',
      secondaryLinks: isStandaloneVariableString(updatedUrls)
        ? updatedUrls
        : updatedUrls.map((url) => ({ url, label: null })),
    });
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormNestedFieldInputContainer>
        <FormTextFieldInput
          label={t`Primary Link Label`}
          defaultValue={defaultValue?.primaryLinkLabel}
          onChange={handleChange('primaryLinkLabel')}
          placeholder={placeholder ?? t`Primary Link Label`}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        <FormTextFieldInput
          label={t`Primary Link URL`}
          defaultValue={defaultValue?.primaryLinkUrl}
          onChange={handleChange('primaryLinkUrl')}
          placeholder={placeholder ?? t`Primary Link URL`}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        {allowsSecondaryLinks && (
          <FormArrayFieldInput
            label={t`Secondary Links`}
            defaultValue={secondaryLinkUrls}
            onChange={handleSecondaryLinksChange}
            readonly={readonly}
            VariablePicker={VariablePicker}
            maxItemCount={maxSecondaryLinkCount}
          />
        )}
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};

import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { type FieldLinksDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import {
  type FieldArrayValue,
  type FormFieldLinksValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import { Field } from 'twenty-ui/primitives/input';

type FormLinksFieldInputProps = {
  label?: string;
  defaultValue?: FormFieldLinksValue;
  onChange: (value: FormFieldLinksValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  subFieldPlaceholders?: Partial<Record<keyof FieldLinksDraftValue, string>>;
  maxNumberOfValues?: number | null;
  isPrimaryLinkUrlOnly?: boolean;
};

export const FormLinksFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
  subFieldPlaceholders,
  maxNumberOfValues,
  isPrimaryLinkUrlOnly = false,
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

  if (isPrimaryLinkUrlOnly) {
    return (
      <FormTextFieldInput
        label={label}
        defaultValue={defaultValue?.primaryLinkUrl}
        onChange={handleChange('primaryLinkUrl')}
        placeholder={subFieldPlaceholders?.primaryLinkUrl ?? t`URL`}
        readonly={readonly}
        VariablePicker={VariablePicker}
      />
    );
  }

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormNestedFieldInputContainer>
        <FormTextFieldInput
          label={t`Primary Link Label`}
          defaultValue={defaultValue?.primaryLinkLabel}
          onChange={handleChange('primaryLinkLabel')}
          placeholder={
            subFieldPlaceholders?.primaryLinkLabel ?? t`Primary Link Label`
          }
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        <FormTextFieldInput
          label={t`Primary Link URL`}
          defaultValue={defaultValue?.primaryLinkUrl}
          onChange={handleChange('primaryLinkUrl')}
          placeholder={
            subFieldPlaceholders?.primaryLinkUrl ?? t`Primary Link URL`
          }
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

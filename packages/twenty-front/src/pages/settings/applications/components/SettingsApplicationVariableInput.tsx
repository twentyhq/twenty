import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { FormRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRichTextFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { TextInput } from '@/ui/input/components/TextInput';
import { t } from '@lingui/core/macro';
import {
  type ApplicationVariableOption,
  deserializeApplicationVariableValue,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

type SettingsApplicationVariableInputProps = {
  type?: string | null;
  value: string;
  options?: ApplicationVariableOption[] | null;
  onChange: (serializedValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const toSelectOptions = (
  options: ApplicationVariableOption[] | null | undefined,
): SelectOption[] =>
  (options ?? []).map((option) => ({
    label: option.label,
    value: option.value,
  }));

const parseStringArray = (value: string): string[] => {
  const parsed = deserializeApplicationVariableValue(
    value,
    FieldMetadataType.MULTI_SELECT,
  );

  return Array.isArray(parsed) ? (parsed as string[]) : [];
};

const parseRichTextValue = (value: string): FieldRichTextValue => {
  try {
    const parsed = JSON.parse(value) as Partial<FieldRichTextValue>;

    if (isDefined(parsed) && typeof parsed === 'object') {
      const blocknote =
        typeof parsed.blocknote === 'string' ? parsed.blocknote : null;
      const markdown =
        typeof parsed.markdown === 'string' ? parsed.markdown : null;

      return { blocknote, markdown };
    }
  } catch {
    return { blocknote: null, markdown: value === '' ? null : value };
  }

  return { blocknote: null, markdown: value === '' ? null : value };
};

export const SettingsApplicationVariableInput = ({
  type,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: SettingsApplicationVariableInputProps) => {
  const fieldType = (type as FieldMetadataType) ?? FieldMetadataType.TEXT;

  switch (fieldType) {
    case FieldMetadataType.BOOLEAN:
      return (
        <FormBooleanFieldInput
          defaultValue={value === '' ? undefined : value === 'true'}
          onChange={(newValue) =>
            onChange(
              newValue === true ? 'true' : newValue === false ? 'false' : '',
            )
          }
          readonly={disabled}
        />
      );

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return (
        <FormNumberFieldInput
          defaultValue={value}
          onChange={(newValue) =>
            onChange(isDefined(newValue) ? String(newValue) : '')
          }
          placeholder={placeholder}
          readonly={disabled}
        />
      );

    case FieldMetadataType.DATE:
      return (
        <FormDateFieldInput
          defaultValue={value === '' ? undefined : value}
          onChange={(newValue) => onChange(newValue ?? '')}
          placeholder={placeholder}
          readonly={disabled}
        />
      );

    case FieldMetadataType.DATE_TIME:
      return (
        <FormDateTimeFieldInput
          defaultValue={value === '' ? undefined : value}
          onChange={(newValue) => onChange(newValue ?? '')}
          placeholder={placeholder}
          readonly={disabled}
        />
      );

    case FieldMetadataType.SELECT:
      return (
        <FormSelectFieldInput
          defaultValue={value === '' ? undefined : value}
          options={toSelectOptions(options)}
          onChange={(newValue) => onChange(newValue ?? '')}
          readonly={disabled}
          isNullable
        />
      );

    case FieldMetadataType.MULTI_SELECT:
      return (
        <FormMultiSelectFieldInput
          defaultValue={parseStringArray(value)}
          options={toSelectOptions(options)}
          onChange={(newValue) =>
            onChange(Array.isArray(newValue) ? JSON.stringify(newValue) : '')
          }
          placeholder={placeholder}
          readonly={disabled}
        />
      );

    case FieldMetadataType.ARRAY:
      return (
        <FormArrayFieldInput
          defaultValue={parseStringArray(value)}
          onChange={(newValue) =>
            onChange(Array.isArray(newValue) ? JSON.stringify(newValue) : '')
          }
          placeholder={placeholder}
          readonly={disabled}
        />
      );

    case FieldMetadataType.RAW_JSON:
      return (
        <FormRawJsonFieldInput
          defaultValue={value === '' ? null : value}
          onChange={(newValue) => onChange(newValue ?? '')}
          placeholder={placeholder}
          readonly={disabled}
        />
      );

    case FieldMetadataType.RICH_TEXT:
      return (
        <FormRichTextFieldInput
          defaultValue={parseRichTextValue(value)}
          onChange={(newValue) => onChange(JSON.stringify(newValue))}
          placeholder={placeholder}
          readonly={disabled}
        />
      );

    default:
      return (
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? t`Value`}
          readOnly={disabled}
          fullWidth
        />
      );
  }
};

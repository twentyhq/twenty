import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldEmailsValue,
  type FieldMetadata,
  type FormFieldLinksValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { RecordFormEmailsFieldInput } from '@/object-record/record-form/components/RecordFormEmailsFieldInput';
import { RecordFormLinksFieldInput } from '@/object-record/record-form/components/RecordFormLinksFieldInput';
import { getRecordFormFieldInputSettings } from '@/object-record/record-form/utils/getRecordFormFieldInputSettings';
import { getLinksVariant } from '@/object-record/spreadsheet-import/utils/getLinksVariant';
import { FieldMetadataType } from 'twenty-shared/types';
import { type JsonValue } from 'type-fest';

type RecordFormFieldInputProps = {
  field: Pick<FieldDefinition<FieldMetadata>, 'label' | 'metadata' | 'type'>;
  defaultValue: JsonValue;
  onChange: (value: JsonValue) => void;
  onClear?: () => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormFieldInput = ({
  field,
  defaultValue,
  onChange,
  onClear,
  readonly,
  placeholder,
}: RecordFormFieldInputProps) =>
  isFieldLinks(field) ? (
    <RecordFormLinksFieldInput
      label={field.label}
      defaultValue={defaultValue as FormFieldLinksValue | undefined}
      onChange={onChange}
      linksVariant={getLinksVariant({
        type: FieldMetadataType.LINKS,
        settings: field.metadata.settings,
      })}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : isFieldEmails(field) ? (
    <RecordFormEmailsFieldInput
      label={field.label}
      defaultValue={defaultValue as FieldEmailsValue | undefined}
      onChange={onChange}
      readonly={readonly}
      placeholder={placeholder}
    />
  ) : (
    <FormFieldInput
      field={field}
      defaultValue={defaultValue}
      onChange={onChange}
      onClear={onClear}
      readonly={readonly}
      placeholder={placeholder}
      settings={getRecordFormFieldInputSettings(field.type)}
    />
  );

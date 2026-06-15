import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';
import { FormMultiRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormMultiRecordPicker';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { getWorkflowCodeFieldsEnumSelectOptions } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsEnumSelectOptions';
import { getWorkflowCodeFieldsLeafKind } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsLeafKind';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type InputSchemaProperty } from 'twenty-shared/workflow';

type WorkflowEditActionCodeFieldLeafProps = {
  label: string;
  inputValue: unknown;
  schemaProperty?: InputSchemaProperty;
  readonly?: boolean;
  onChange: (value: unknown) => void;
  VariablePicker?: VariablePickerComponent;
};

export const WorkflowEditActionCodeFieldLeaf = ({
  label,
  inputValue,
  schemaProperty,
  readonly,
  onChange,
  VariablePicker,
}: WorkflowEditActionCodeFieldLeafProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const leafKind = getWorkflowCodeFieldsLeafKind(schemaProperty);

  if (leafKind === 'record' || leafKind === 'record-array') {
    const objectUniversalIdentifier =
      leafKind === 'record'
        ? schemaProperty?.objectUniversalIdentifier
        : schemaProperty?.items?.objectUniversalIdentifier;

    const recordObjectMetadataItem = isNonEmptyString(objectUniversalIdentifier)
      ? objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.universalIdentifier ===
            objectUniversalIdentifier,
        )
      : undefined;

    if (isDefined(recordObjectMetadataItem)) {
      if (leafKind === 'record') {
        return (
          <FormSingleRecordPicker
            label={label}
            defaultValue={
              typeof inputValue === 'string' && inputValue.length > 0
                ? inputValue
                : undefined
            }
            onChange={onChange}
            objectNameSingulars={[recordObjectMetadataItem.nameSingular]}
            disabled={readonly}
            VariablePicker={VariablePicker}
            shouldDisplayRecordFieldsInVariablePicker={true}
          />
        );
      }

      return (
        <FormMultiRecordPicker
          label={label}
          defaultValue={
            Array.isArray(inputValue) ||
            typeof inputValue === 'string' ||
            inputValue === null
              ? inputValue
              : undefined
          }
          onChange={onChange}
          objectNameSingular={recordObjectMetadataItem.nameSingular}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
      );
    }
  }

  if (leafKind === 'boolean') {
    return (
      <FormBooleanFieldInput
        label={label}
        defaultValue={
          typeof inputValue === 'boolean' ||
          isStandaloneVariableString(inputValue)
            ? inputValue
            : undefined
        }
        readonly={readonly}
        onChange={onChange}
        VariablePicker={VariablePicker}
      />
    );
  }

  if (leafKind === 'number') {
    return (
      <FormNumberFieldInput
        label={label}
        defaultValue={
          !isDefined(inputValue)
            ? undefined
            : typeof inputValue === 'number' || typeof inputValue === 'string'
              ? inputValue
              : undefined
        }
        readonly={readonly}
        onChange={onChange}
        VariablePicker={VariablePicker}
      />
    );
  }

  if (leafKind === 'enum' && isDefined(schemaProperty)) {
    const enumOptions = getWorkflowCodeFieldsEnumSelectOptions(schemaProperty);

    if (isNonEmptyArray(enumOptions)) {
      return (
        <FormSelectFieldInput
          label={label}
          defaultValue={
            !isDefined(inputValue)
              ? undefined
              : typeof inputValue === 'string'
                ? inputValue
                : String(inputValue)
          }
          readonly={readonly}
          onChange={onChange}
          VariablePicker={VariablePicker}
          options={enumOptions}
        />
      );
    }
  }

  return (
    <FormTextFieldInput
      label={label}
      placeholder={t`Enter value`}
      defaultValue={isDefined(inputValue) ? `${inputValue}` : ''}
      readonly={readonly}
      onChange={onChange}
      VariablePicker={VariablePicker}
      multiline={schemaProperty?.multiline === true}
    />
  );
};

import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { WorkflowFormFieldInput } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowFormFieldInput';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { isAiFormInlineSelectSettings } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

type WorkflowFormFieldsProps = {
  fields: Omit<WorkflowFormActionField, 'id'>[];
  readonly: boolean;
  onChange: (fieldName: string, value: unknown) => void;
  onError?: (error: string | undefined) => void;
};

// The fields a person fills in to answer a form, whether a workflow form step
// or an agent asked for it.
export const WorkflowFormFields = ({
  fields,
  readonly,
  onChange,
  onError,
}: WorkflowFormFieldsProps) => (
  <>
    {fields.map((field) => {
      if (field.type === 'RECORD') {
        const objectNameSingular = field.settings?.objectName;

        if (!isDefined(objectNameSingular)) {
          return null;
        }

        return (
          <FormSingleRecordPicker
            key={field.name}
            label={field.label}
            defaultValue={field.value?.id}
            onChange={(recordId) => {
              onChange(field.name, { id: recordId });
            }}
            objectNameSingulars={[objectNameSingular]}
            disabled={readonly}
          />
        );
      }

      // Choices an agent listed itself; workflow form steps never set them.
      if (
        (field.type === 'SELECT' || field.type === 'MULTI_SELECT') &&
        isAiFormInlineSelectSettings(field.settings)
      ) {
        const options = field.settings.options.map((option) => ({
          value: option.value,
          label: option.label,
        }));

        return field.type === 'SELECT' ? (
          // Nullable, so nothing reads as chosen before the person picks.
          <FormSelectFieldInput
            key={field.name}
            label={field.label}
            defaultValue={field.value}
            options={options}
            isNullable
            readonly={readonly}
            onChange={(value) => {
              onChange(field.name, value);
            }}
          />
        ) : (
          <FormMultiSelectFieldInput
            key={field.name}
            label={field.label}
            defaultValue={field.value}
            options={options}
            readonly={readonly}
            onChange={(value) => {
              onChange(field.name, value);
            }}
          />
        );
      }

      if (field.type === 'SELECT' || field.type === 'MULTI_SELECT') {
        const selectedFieldId = field.settings?.selectedFieldId;

        if (!isDefined(selectedFieldId)) {
          return null;
        }

        return (
          <WorkflowFormFieldInput
            key={field.name}
            fieldMetadataId={selectedFieldId}
            defaultValue={field.value}
            readonly={readonly}
            onChange={(value) => {
              onChange(field.name, value);
            }}
          />
        );
      }

      return (
        <FormFieldInput
          key={field.name}
          field={{
            label: field.label,
            type: field.type,
            metadata: {} as FieldMetadata,
          }}
          onChange={(value) => {
            onChange(field.name, value);
          }}
          defaultValue={field.value}
          readonly={readonly}
          placeholder={
            field.placeholder ??
            getDefaultFormFieldSettings(field.type).placeholder
          }
          onError={onError}
        />
      );
    })}
  </>
);

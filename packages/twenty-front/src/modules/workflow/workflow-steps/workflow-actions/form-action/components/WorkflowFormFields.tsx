import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { WorkflowFormFieldInput } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowFormFieldInput';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { isDefined } from 'twenty-shared/utils';

type WorkflowFormFieldsProps = {
  fields: Omit<WorkflowFormActionField, 'id'>[];
  readonly: boolean;
  onChange: (fieldName: string, value: unknown) => void;
  onError?: (error: string | undefined) => void;
};

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

import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { WorkflowFormFieldInput } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowFormFieldInput';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { isDefined } from 'twenty-shared/utils';

type WorkflowFormFillerFieldsProps = {
  fields: WorkflowFormActionField[];
  readonly: boolean;
  onFieldUpdate: (update: { fieldId: string; value: unknown }) => void;
  onError: (error: string | undefined) => void;
};

export const WorkflowFormFillerFields = ({
  fields,
  readonly,
  onFieldUpdate,
  onError,
}: WorkflowFormFillerFieldsProps) => (
  <>
    {fields.map((field) => {
      if (field.type === 'RECORD') {
        const objectNameSingular = field.settings?.objectName;

        if (!isDefined(objectNameSingular)) {
          return null;
        }

        return (
          <FormSingleRecordPicker
            key={field.id}
            label={field.label}
            defaultValue={field.value?.id}
            onChange={(recordId) => {
              onFieldUpdate({ fieldId: field.id, value: { id: recordId } });
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
            key={field.id}
            fieldMetadataId={selectedFieldId}
            defaultValue={field.value}
            readonly={readonly}
            onChange={(value) => {
              onFieldUpdate({ fieldId: field.id, value });
            }}
          />
        );
      }

      return (
        <FormFieldInput
          key={field.id}
          field={{
            label: field.label,
            type: field.type,
            metadata: {} as FieldMetadata,
          }}
          onChange={(value) => {
            onFieldUpdate({ fieldId: field.id, value });
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

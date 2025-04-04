import { WorkflowFormFieldSettingsDate } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsDate';
import { WorkflowFormFieldSettingsRecordPicker } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsRecordPicker';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { WorkflowFormFieldSettingsNumber } from './WorkflowFormFieldSettingsNumber';
import { WorkflowFormFieldSettingsText } from './WorkflowFormFieldSettingsText';

export const WorkflowFormFieldSettingsByType = ({
  field,
  onChange,
}: {
  field: WorkflowFormActionField;
  onChange: (fieldName: string, value: unknown) => void;
}) => {
  switch (field.type) {
    case FieldMetadataType.TEXT:
      return (
        <WorkflowFormFieldSettingsText
          label={field.label}
          placeholder={field.placeholder}
          onChange={(fieldName, value) => {
            onChange(fieldName, value);
          }}
        />
      );
    case FieldMetadataType.NUMBER:
      return (
        <WorkflowFormFieldSettingsNumber
          label={field.label}
          placeholder={field.placeholder}
          onChange={(fieldName, value) => {
            onChange(fieldName, value);
          }}
        />
      );
    case FieldMetadataType.DATE:
      return (
        <WorkflowFormFieldSettingsDate
          label={field.label}
          onChange={(fieldName, value) => {
            onChange(fieldName, value);
          }}
        />
      );
    case 'RECORD':
      return (
        <WorkflowFormFieldSettingsRecordPicker
          label={field.label}
          settings={field.settings}
          onChange={(fieldName, value) => {
            onChange(fieldName, value);
          }}
        />
      );
    default:
      return assertUnreachable(field.type, 'Unknown form field type');
  }
};

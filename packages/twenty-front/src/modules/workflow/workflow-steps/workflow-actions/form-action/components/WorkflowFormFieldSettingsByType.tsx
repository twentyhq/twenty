import { WorkflowFormFieldSettingsDate } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsDate';
import { WorkflowFormFieldSettingsRecordPicker } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsRecordPicker';
import { WorkflowFormFieldSettingsSelect } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsSelect';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { WorkflowFormFieldSettingsNumber } from './WorkflowFormFieldSettingsNumber';
import { WorkflowFormFieldSettingsText } from './WorkflowFormFieldSettingsText';

export const WorkflowFormFieldSettingsByType = ({
  field,
  onChange,
}: {
  field: WorkflowFormActionField;
  onChange: (updatedField: WorkflowFormActionField) => void;
}) => {
  switch (field.type) {
    case FieldMetadataType.TEXT:
      return (
        <WorkflowFormFieldSettingsText field={field} onChange={onChange} />
      );
    case FieldMetadataType.NUMBER:
      return (
        <WorkflowFormFieldSettingsNumber field={field} onChange={onChange} />
      );
    case FieldMetadataType.DATE:
      return (
        <WorkflowFormFieldSettingsDate field={field} onChange={onChange} />
      );
    case FieldMetadataType.SELECT:
      return (
        <WorkflowFormFieldSettingsSelect field={field} onChange={onChange} />
      );
    case 'RECORD':
      return (
        <WorkflowFormFieldSettingsRecordPicker
          field={field}
          onChange={onChange}
        />
      );
    default:
      return assertUnreachable(field.type, 'Unknown form field type');
  }
};

import { type WorkflowCreateRecordAction } from '@/workflow/types/Workflow';
import { useState } from 'react';
import { type JsonValue } from 'type-fest';
import { WorkflowEditActionRecordBase } from './WorkflowEditActionRecordBase';

type WorkflowEditActionCreateRecordProps = {
  action: WorkflowCreateRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowCreateRecordAction) => void;
      };
};

type RelationManyToOneField = {
  id: string;
};

type CreateRecordFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
};

export const WorkflowEditActionCreateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionCreateRecordProps) => {
  const [formData, setFormData] = useState<CreateRecordFormData>({
    objectName: action.settings.input.objectName,
    ...action.settings.input.objectRecord,
  });

  return (
    <WorkflowEditActionRecordBase
      mode="create"
      action={action}
      actionOptions={actionOptions}
      formData={formData}
      setFormData={setFormData}
      defaultTitle="Create Record"
    />
  );
};

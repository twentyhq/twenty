import { type WorkflowCreateRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import {
  WorkflowCreateRecordBody,
  type CreateRecordFormData,
} from '@/workflow/workflow-steps/workflow-actions/components/WorkflowCreateRecordBody';

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

export const WorkflowEditActionCreateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionCreateRecordProps) => {
  const isFormDisabled = actionOptions.readonly;

  const handleUpdate = (formData: CreateRecordFormData) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const { objectName: updatedObjectName, ...updatedOtherFields } = formData;

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          objectName: updatedObjectName,
          objectRecord: updatedOtherFields,
        },
      },
    });
  };

  return (
    <>
      <WorkflowCreateRecordBody
        defaultObjectName={action.settings.input.objectName}
        defaultObjectRecord={action.settings.input.objectRecord}
        readonly={isFormDisabled ?? false}
        actionType="CREATE_RECORD"
        onUpdate={handleUpdate}
      />
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};

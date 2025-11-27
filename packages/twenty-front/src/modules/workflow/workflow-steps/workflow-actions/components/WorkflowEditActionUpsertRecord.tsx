import { type WorkflowUpsertRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import {
  WorkflowCreateRecordBody,
  type CreateRecordFormData,
} from '@/workflow/workflow-steps/workflow-actions/components/WorkflowCreateRecordBody';

type WorkflowEditActionUpsertRecordProps = {
  action: WorkflowUpsertRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowUpsertRecordAction) => void;
      };
};

export const WorkflowEditActionUpsertRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionUpsertRecordProps) => {
  const isFormDisabled = actionOptions.readonly === true;

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
        readonly={isFormDisabled}
        actionType="UPSERT_RECORD"
        onUpdate={handleUpdate}
      />
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};

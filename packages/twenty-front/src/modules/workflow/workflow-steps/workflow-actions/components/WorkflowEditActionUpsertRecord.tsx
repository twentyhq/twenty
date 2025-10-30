import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { type WorkflowUpsertRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import {
  WorkflowCreateRecordBody,
  type CreateRecordFormData,
} from '@/workflow/workflow-steps/workflow-actions/components/WorkflowCreateRecordBody';

import { UPSERT_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/UpsertRecordAction';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { useIcons } from 'twenty-ui/display';

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
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: UPSERT_RECORD_ACTION.defaultLabel,
    });

  const { getIcon } = useIcons();

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
      <SidePanelHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={isFormDisabled}
        iconTooltip={UPSERT_RECORD_ACTION.defaultLabel}
      />
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

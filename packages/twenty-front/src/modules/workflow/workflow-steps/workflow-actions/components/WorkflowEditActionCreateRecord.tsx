import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { type WorkflowCreateRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import {
  WorkflowCreateRecordBody,
  type CreateRecordFormData,
} from '@/workflow/workflow-steps/workflow-actions/components/WorkflowCreateRecordBody';
import { CREATE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CreateRecordAction';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { useIcons } from 'twenty-ui/display';

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
  const { getIcon } = useIcons();

  const isFormDisabled = actionOptions.readonly;

  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: CREATE_RECORD_ACTION.defaultLabel,
    });

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
        iconTooltip={CREATE_RECORD_ACTION.defaultLabel}
      />
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

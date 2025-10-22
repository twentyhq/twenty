import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { type WorkflowUpdateRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowUpdateRecordBody } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowUpdateRecordBody';

import { UPDATE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/UpdateRecordAction';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { type UpdateRecordFormData } from '@/workflow/workflow-steps/workflow-actions/types/update-record-form-data.type';
import { useIcons } from 'twenty-ui/display';

type WorkflowEditActionUpdateRecordProps = {
  action: WorkflowUpdateRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowUpdateRecordAction) => void;
      };
};

export const WorkflowEditActionUpdateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionUpdateRecordProps) => {
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: UPDATE_RECORD_ACTION.defaultLabel,
    });

  const { getIcon } = useIcons();

  const isFormDisabled = actionOptions.readonly === true;

  const handleUpdate = (formData: UpdateRecordFormData) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          objectName: formData.objectNameSingular,
          objectRecord: formData,
          objectRecordId: formData.objectRecordId ?? '',
          fieldsToUpdate: formData.fieldsToUpdate,
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
        iconTooltip={UPDATE_RECORD_ACTION.defaultLabel}
      />
      <WorkflowUpdateRecordBody
        defaultObjectNameSingular={action.settings.input.objectName}
        defaultObjectRecordId={action.settings.input.objectRecordId}
        defaultFieldsToUpdate={action.settings.input.fieldsToUpdate}
        defaultObjectRecord={action.settings.input.objectRecord}
        readonly={isFormDisabled}
        actionType="UPDATE_RECORD"
        onUpdate={handleUpdate}
        shouldPickRecord={true}
      />
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};

import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { type WorkflowUpsertRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowUpdateRecordBody } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowUpdateRecordBody';

import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { type UpdateRecordFormData } from '@/workflow/workflow-steps/workflow-actions/types/update-record-form-data.type';
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
      defaultTitle: 'Create or Update Record',
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
      />
      <WorkflowUpdateRecordBody
        defaultObjectNameSingular={action.settings.input.objectName}
        defaultFieldsToUpdate={action.settings.input.fieldsToUpdate}
        defaultObjectRecord={action.settings.input.objectRecord}
        readonly={isFormDisabled}
        actionType="UPSERT_RECORD"
        onUpdate={handleUpdate}
        shouldPickRecord={false}
      />
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};

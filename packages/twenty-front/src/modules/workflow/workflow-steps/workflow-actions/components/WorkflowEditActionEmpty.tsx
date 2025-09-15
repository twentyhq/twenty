import { type WorkflowEmptyAction } from '@/workflow/types/Workflow';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { useIcons } from 'twenty-ui/display';

type WorkflowEditActionEmptyProps = {
  action: WorkflowEmptyAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowEmptyAction) => void;
      };
};

export const WorkflowEditActionEmpty = ({
  action,
  actionOptions,
}: WorkflowEditActionEmptyProps) => {
  const { getIcon } = useIcons();
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'Empty Node',
    });

  return (
    <>
      <WorkflowStepHeader
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
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>{'Empty Node'}</WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowActionFooter stepId={action.id} />}
    </>
  );
};

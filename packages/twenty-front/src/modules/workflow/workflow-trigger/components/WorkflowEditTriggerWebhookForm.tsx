import { WorkflowWebhookTrigger } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useIcons } from 'twenty-ui';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { isDefined } from 'twenty-shared';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';

type WorkflowEditTriggerWebhookFormProps = {
  trigger: WorkflowWebhookTrigger;
  triggerOptions:
    | {
        readonly: true;
        onTriggerUpdate?: undefined;
      }
    | {
        readonly?: false;
        onTriggerUpdate: (trigger: WorkflowWebhookTrigger) => void;
      };
};
export const WorkflowEditTriggerWebhookForm = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerWebhookFormProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const headerTitle = isDefined(trigger.name) ? trigger.name : 'Webhook';

  const headerIcon = getTriggerIcon({
    type: 'WEBHOOK',
  });

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (triggerOptions.readonly === true) {
            return;
          }

          triggerOptions.onTriggerUpdate({
            ...trigger,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType="Trigger · Webhook"
        disabled={triggerOptions.readonly}
      />
      <WorkflowStepBody></WorkflowStepBody>
    </>
  );
};

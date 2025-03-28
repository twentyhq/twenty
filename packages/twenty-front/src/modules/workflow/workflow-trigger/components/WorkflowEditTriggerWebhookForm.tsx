import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowWebhookTrigger } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { IconCopy, useIcons } from 'twenty-ui/display';

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
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const workflowId = useRecoilValue(workflowIdState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const headerTitle = isDefined(trigger.name) ? trigger.name : 'Webhook';

  const headerIcon = getTriggerIcon({
    type: 'WEBHOOK',
  });

  const webhookUrl = `${REACT_APP_SERVER_BASE_URL}/webhooks/workflows/${currentWorkspace?.id}/${workflowId}`;
  const displayWebhookUrl = webhookUrl.replace(/^(https?:\/\/)?(www\.)?/, '');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    enqueueSnackBar(t`Copied to clipboard!`, {
      variant: SnackBarVariant.Success,
      icon: <IconCopy size={theme.icon.size.md} />,
    });
  };

  const copyToClipboardDebounced = useDebouncedCallback(copyToClipboard, 200);

  if (!isDefined(currentWorkspace)) {
    return <></>;
  }

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
      <WorkflowStepBody>
        <TextInputV2
          label="Live URL"
          value={displayWebhookUrl}
          RightIcon={() => (
            <IconCopy
              size={theme.icon.size.md}
              color={theme.font.color.secondary}
            />
          )}
          onRightIconClick={copyToClipboardDebounced}
          readOnly
        />
      </WorkflowStepBody>
    </>
  );
};

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FormRawJsonFieldInput } from '@/object-record/record-field/form-types/components/FormRawJsonFieldInput';
import { getFunctionOutputSchema } from '@/serverless-functions/utils/getFunctionOutputSchema';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowWebhookTrigger } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WEBHOOK_TRIGGER_AUTHENTICATION_OPTIONS } from '@/workflow/workflow-trigger/constants/WebhookTriggerAuthenticationOptions';
import { WEBHOOK_TRIGGER_HTTP_METHOD_OPTIONS } from '@/workflow/workflow-trigger/constants/WebhookTriggerHttpMethodOptions';
import { getTriggerHeaderType } from '@/workflow/workflow-trigger/utils/getTriggerHeaderType';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerLabel';
import { getWebhookTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getWebhookTriggerDefaultSettings';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy, useIcons } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type WorkflowEditTriggerWebhookFormProps = {
  trigger: WorkflowWebhookTrigger;
  triggerOptions:
    | {
        readonly: true;
        onTriggerUpdate?: undefined;
      }
    | {
        readonly?: false;
        onTriggerUpdate: (
          trigger: WorkflowWebhookTrigger,
          options?: { computeOutputSchema: boolean },
        ) => void;
      };
};

type FormErrorMessages = {
  expectedBody?: string | undefined;
};

export const WorkflowEditTriggerWebhookForm = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerWebhookFormProps) => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const { t } = useLingui();
  const [errorMessages, setErrorMessages] = useState<FormErrorMessages>({});
  const [errorMessagesVisible, setErrorMessagesVisible] = useState(false);
  const { getIcon } = useIcons();
  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const onBlur = () => {
    setErrorMessagesVisible(true);
  };

  const headerTitle = trigger.name ?? getTriggerDefaultLabel(trigger);

  const headerIcon = getTriggerIcon(trigger);
  const headerType = getTriggerHeaderType(trigger);

  const webhookUrl = `${REACT_APP_SERVER_BASE_URL}/webhooks/workflows/${currentWorkspace?.id}/${workflowVisualizerWorkflowId}`;
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
        headerType={headerType}
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
        <Select
          dropdownId="workflow-edit-webhook-trigger-http-method"
          label="HTTP method"
          fullWidth
          disabled={triggerOptions.readonly}
          value={trigger.settings.httpMethod}
          options={WEBHOOK_TRIGGER_HTTP_METHOD_OPTIONS}
          onChange={(newTriggerType) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate(
              {
                ...trigger,
                settings: getWebhookTriggerDefaultSettings(newTriggerType),
              },
              { computeOutputSchema: false },
            );
          }}
        />
        {trigger.settings.httpMethod === 'POST' && (
          <FormRawJsonFieldInput
            label="Expected Body"
            placeholder="Enter a JSON object"
            error={
              errorMessagesVisible ? errorMessages.expectedBody : undefined
            }
            onBlur={onBlur}
            readonly={triggerOptions.readonly}
            defaultValue={JSON.stringify(trigger.settings.expectedBody)}
            onChange={(newExpectedBody) => {
              if (triggerOptions.readonly === true) {
                return;
              }

              let formattedExpectedBody = {};
              try {
                formattedExpectedBody = JSON.parse(newExpectedBody || '{}');
              } catch (e) {
                setErrorMessages((prev) => ({
                  ...prev,
                  expectedBody: String(e),
                }));
                return;
              }

              setErrorMessages((prev) => ({
                ...prev,
                expectedBody: undefined,
              }));

              const outputSchema = getFunctionOutputSchema(
                formattedExpectedBody,
              );

              triggerOptions.onTriggerUpdate(
                {
                  ...trigger,
                  settings: {
                    ...trigger.settings,
                    expectedBody: formattedExpectedBody,
                    outputSchema,
                  } as WorkflowWebhookTrigger['settings'],
                },
                { computeOutputSchema: false },
              );
            }}
          />
        )}
        <Select
          dropdownId="workflow-edit-webhook-trigger-auth"
          label="Auth"
          fullWidth
          disabled
          value={trigger.settings.authentication}
          options={WEBHOOK_TRIGGER_AUTHENTICATION_OPTIONS}
          onChange={(newAuthenticationType) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: {
                ...trigger.settings,
                authentication: newAuthenticationType,
              },
            });
          }}
        />
      </WorkflowStepBody>
    </>
  );
};

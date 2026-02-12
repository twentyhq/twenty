import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowWebhookTrigger } from '@/workflow/types/Workflow';
import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WEBHOOK_TRIGGER_AUTHENTICATION_OPTIONS } from '@/workflow/workflow-trigger/constants/WebhookTriggerAuthenticationOptions';
import { WEBHOOK_TRIGGER_HTTP_METHOD_OPTIONS } from '@/workflow/workflow-trigger/constants/WebhookTriggerHttpMethodOptions';
import { getWebhookTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getWebhookTriggerDefaultSettings';
import { useTheme } from '@emotion/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  buildOutputSchemaFromValue,
  TRIGGER_STEP_ID,
} from 'twenty-shared/workflow';
import { t } from '@lingui/core/macro';
import { IconCopy } from 'twenty-ui/display';

import { useDebouncedCallback } from 'use-debounce';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const [errorMessages, setErrorMessages] = useState<FormErrorMessages>({});
  const [errorMessagesVisible, setErrorMessagesVisible] = useState(false);
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const onBlur = () => {
    setErrorMessagesVisible(true);
  };

  const webhookUrl = `${REACT_APP_SERVER_BASE_URL}/webhooks/workflows/${currentWorkspace?.id}/${workflowVisualizerWorkflowId}`;
  const displayWebhookUrl = webhookUrl.replace(/^(https?:\/\/)?(www\.)?/, '');

  const copyToClipboardDebounced = useDebouncedCallback(
    () => copyToClipboard(webhookUrl),
    200,
  );

  if (!isDefined(currentWorkspace)) {
    return <></>;
  }

  return (
    <>
      <WorkflowStepBody>
        <TextInput
          label={t`Live URL`}
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
          label={t`HTTP method`}
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
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
        {trigger.settings.httpMethod === 'POST' && (
          <FormRawJsonFieldInput
            label={t`Expected Body`}
            placeholder={t`Enter a JSON object`}
            error={
              errorMessagesVisible ? errorMessages.expectedBody : undefined
            }
            onBlur={onBlur}
            readonly={triggerOptions.readonly}
            defaultValue={JSON.stringify(
              trigger.settings.expectedBody,
              null,
              2,
            )}
            onChange={(newExpectedBody) => {
              if (triggerOptions.readonly === true) {
                return;
              }

              const parsingResult =
                parseAndValidateVariableFriendlyStringifiedJson(
                  isNonEmptyString(newExpectedBody) ? newExpectedBody : '{}',
                );

              if (!parsingResult.isValid) {
                setErrorMessages((prev) => ({
                  ...prev,
                  expectedBody: parsingResult.error,
                }));

                return;
              }

              setErrorMessages((prev) => ({
                ...prev,
                expectedBody: undefined,
              }));

              const outputSchema = buildOutputSchemaFromValue(
                parsingResult.data,
              );

              triggerOptions.onTriggerUpdate(
                {
                  ...trigger,
                  settings: {
                    ...trigger.settings,
                    httpMethod: 'POST',
                    expectedBody: parsingResult.data,
                    outputSchema,
                  } satisfies WorkflowWebhookTrigger['settings'],
                },
                { computeOutputSchema: false },
              );
            }}
          />
        )}
        <Select
          dropdownId="workflow-edit-webhook-trigger-auth"
          label={t`Auth`}
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
      {!triggerOptions.readonly && (
        <WorkflowStepFooter stepId={TRIGGER_STEP_ID} />
      )}
    </>
  );
};

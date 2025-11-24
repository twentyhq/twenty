import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import {
  type AgentResponseSchema,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  useFindOneAgentQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import { SettingsAgentModelCapabilities } from '~/pages/settings/ai/components/SettingsAgentModelCapabilities';
import { SettingsAgentResponseFormat } from '~/pages/settings/ai/components/SettingsAgentResponseFormat';

type WorkflowEditActionAiAgentProps = {
  action: WorkflowAiAgentAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowAiAgentAction) => void;
      };
};

export const WorkflowEditActionAiAgent = ({
  action,
  actionOptions,
}: WorkflowEditActionAiAgentProps) => {
  const agentId = action.settings.input.agentId;
  const { data: agentData, loading: agentLoading } = useFindOneAgentQuery({
    variables: { id: agentId || '' },
    skip: !agentId,
  });
  const [updateAgent] = useUpdateOneAgentMutation();
  const aiModelOptions = useAiModelOptions();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();
  const flow = useFlowOrThrow();

  const agent = agentData?.findOneAgent;

  const handleAgentPromptChange = useDebouncedCallback(
    async (newPrompt: string) => {
      if (actionOptions.readonly === true || !isDefined(agent)) {
        return;
      }

      await updateAgent({
        variables: {
          input: {
            id: agent.id,
            prompt: newPrompt,
          },
        },
        refetchQueries: ['FindOneAgent'],
      });
    },
    500,
  );

  const handleAgentModelChange = async (modelId: string) => {
    if (actionOptions.readonly === true || !isDefined(agent)) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agent.id,
          modelId,
        },
      },
      refetchQueries: ['FindOneAgent'],
    });
  };

  const handleModelConfigurationChange = async (
    configuration: ModelConfiguration,
  ) => {
    if (actionOptions.readonly === true || !isDefined(agent)) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agent.id,
          modelConfiguration: configuration,
        },
      },
      refetchQueries: ['FindOneAgent'],
    });
  };

  const updateAgentResponseFormat = async (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => {
    if (actionOptions.readonly === true || !isDefined(agent)) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agent.id,
          responseFormat: format,
        },
      },
      refetchQueries: ['FindOneAgent'],
    });

    await updateWorkflowVersionStep({
      workflowVersionId: flow.workflowVersionId,
      step: action,
    });
  };

  const debouncedUpdateAgentResponseFormat = useDebouncedCallback(
    updateAgentResponseFormat,
    300,
  );

  const handleAgentResponseFormatChange = async (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => {
    if (format.type !== agent?.responseFormat?.type) {
      debouncedUpdateAgentResponseFormat.cancel();
      void updateAgentResponseFormat(format);
    } else {
      void debouncedUpdateAgentResponseFormat(format);
    }
  };

  return agentLoading ? (
    <RightDrawerSkeletonLoader />
  ) : (
    <>
      <WorkflowStepBody>
        <FormTextFieldInput
          multiline
          VariablePicker={WorkflowVariablePicker}
          label={t`Instructions for AI`}
          placeholder={t`Describe what you want the AI to do...`}
          defaultValue={agent?.prompt || ''}
          onChange={handleAgentPromptChange}
          readonly={actionOptions.readonly}
        />

        {isDefined(agent) && (
          <>
            <Select
              dropdownId="select-agent-model"
              label={t`AI Model`}
              options={aiModelOptions}
              value={agent.modelId}
              onChange={handleAgentModelChange}
              disabled={actionOptions.readonly}
            />

            <SettingsAgentModelCapabilities
              selectedModelId={agent.modelId}
              modelConfiguration={agent.modelConfiguration || {}}
              onConfigurationChange={handleModelConfigurationChange}
              disabled={actionOptions.readonly}
            />

            <SettingsAgentResponseFormat
              responseFormat={
                agent.responseFormat || { type: 'text', schema: {} }
              }
              onResponseFormatChange={handleAgentResponseFormatChange}
              disabled={actionOptions.readonly}
            />
          </>
        )}
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};

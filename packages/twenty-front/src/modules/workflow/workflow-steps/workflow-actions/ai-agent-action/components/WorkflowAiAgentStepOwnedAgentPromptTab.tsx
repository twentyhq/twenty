import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { WorkflowAiAgentConversationFields } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentConversationFields';
import { WorkflowAiAgentOutputFormatField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentOutputFormatField';
import { WorkflowAiAgentPromptField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPromptField';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { type WorkflowAiAgentStepPanelProps } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepPanelProps';
import { useMutation } from '@apollo/client/react';
import { type ModelConfiguration } from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import {
  UpdateOneAgentDocument,
  type UpdateOneAgentMutationVariables,
} from '~/generated-metadata/graphql';

type WorkflowAiAgentStepOwnedAgentPromptTabProps =
  WorkflowAiAgentStepPanelProps;

// a step created before steps held their own config edits its hidden agent's model, as it always did
export const WorkflowAiAgentStepOwnedAgentPromptTab = ({
  stepId,
  input,
  readonly,
  onInputChange,
}: WorkflowAiAgentStepOwnedAgentPromptTabProps) => {
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const { getUpdatableWorkflowVersionStepOrThrow } =
    useGetUpdatableWorkflowVersionOrThrow();

  const updateAgentField = async (
    agentInput: Omit<UpdateOneAgentMutationVariables['input'], 'id'>,
  ) => {
    if (readonly || !workflowAiAgentActionAgent) {
      return;
    }

    const updatableStep = await getUpdatableWorkflowVersionStepOrThrow({
      stepId,
      stepType: 'AI_AGENT',
    });

    const updatableAgentId = updatableStep.settings.input.agentId;

    if (!isDefined(updatableAgentId)) {
      throw new Error(doNotTranslate('The AI agent step has no agent'));
    }

    const response = await updateAgent({
      variables: {
        input: {
          id: updatableAgentId,
          ...agentInput,
        },
      },
    });

    setWorkflowAiAgentActionAgent((currentWorkflowAiAgentActionAgent) =>
      currentWorkflowAiAgentActionAgent
        ? {
            ...currentWorkflowAiAgentActionAgent,
            ...response.data?.updateOneAgent,
          }
        : currentWorkflowAiAgentActionAgent,
    );
  };

  if (!isDefined(workflowAiAgentActionAgent)) {
    return null;
  }

  return (
    <>
      <AiModelPicker
        modelId={workflowAiAgentActionAgent.modelId}
        onModelIdChange={(modelId) => updateAgentField({ modelId })}
        disabled={readonly}
      />

      <WorkflowAiAgentPromptField
        prompt={input.prompt}
        readonly={readonly}
        onPromptChange={(prompt) => onInputChange({ prompt })}
      />

      <WorkflowAiAgentConversationFields
        stepId={stepId}
        input={input}
        readonly={readonly}
        onInputChange={onInputChange}
      />

      <SettingsAgentModelCapabilities
        selectedModelId={workflowAiAgentActionAgent.modelId}
        modelConfiguration={workflowAiAgentActionAgent.modelConfiguration || {}}
        onConfigurationChange={(modelConfiguration: ModelConfiguration) =>
          updateAgentField({ modelConfiguration })
        }
        disabled={readonly}
      />

      <WorkflowAiAgentOutputFormatField
        responseFormat={
          input.responseFormat ?? workflowAiAgentActionAgent.responseFormat
        }
        readonly={readonly}
        onResponseFormatChange={(responseFormat) =>
          onInputChange({ responseFormat })
        }
      />
    </>
  );
};

import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { type OutputSchemaField } from '@/ai/types/OutputSchemaField';
import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { createDefaultOutputSchemaField } from '@/ai/utils/createDefaultOutputSchemaField';
import { fieldsToSchema } from '@/ai/utils/fieldsToSchema';
import { schemaToFields } from '@/ai/utils/schemaToFields';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowConversationFields } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowConversationFields';
import { AgentOutputSchemaBuilder } from '@/ai/components/AgentOutputSchemaBuilder';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  type AgentResponseSchema,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowConversation } from 'twenty-shared/workflow';
import {
  FeatureFlagKey,
  UpdateOneAgentDocument,
  type UpdateOneAgentMutationVariables,
} from '~/generated-metadata/graphql';

type WorkflowAiAgentPromptTabProps = {
  action: WorkflowAiAgentAction;
  // a step running an agent edits the agent's model; any other step edits its own config
  isAgentBacked: boolean;
  prompt: string;
  readonly: boolean;
  onPromptChange: (value: string) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  modelId: string | undefined;
  onModelIdChange: (modelId: string) => void;
  modelConfiguration: ModelConfiguration | undefined;
  onModelConfigurationChange: (configuration: ModelConfiguration) => void;
  humanInputInstructions: string;
  onHumanInputInstructionsChange: (value: string) => void;
  recipientWorkspaceMemberId: string | undefined;
  onRecipientChange: (workspaceMemberId: string | undefined) => void;
  conversation: WorkflowConversation | undefined;
  onConversationChange: (conversation: WorkflowConversation) => void;
  onResponseSchemaChange: (responseSchema: AgentResponseSchema) => void;
};

export const WorkflowAiAgentPromptTab = ({
  action,
  isAgentBacked,
  prompt,
  readonly,
  onPromptChange,
  instructions,
  onInstructionsChange,
  modelId,
  onModelIdChange,
  modelConfiguration,
  onModelConfigurationChange,
  humanInputInstructions,
  onHumanInputInstructionsChange,
  recipientWorkspaceMemberId,
  onRecipientChange,
  conversation,
  onConversationChange,
  onResponseSchemaChange,
}: WorkflowAiAgentPromptTabProps) => {
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const { getUpdatableWorkflowVersionStepOrThrow } =
    useGetUpdatableWorkflowVersionOrThrow();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const [outputSchemaFields, setOutputSchemaFields] = useState<
    OutputSchemaField[]
  >(() => {
    // steps saved before the format moved to them still carry it on their agent
    const responseFormat =
      action.settings.input.responseFormat ??
      (isAgentBacked ? workflowAiAgentActionAgent?.responseFormat : undefined);
    const schema: AgentResponseSchema = (responseFormat?.type === 'json'
      ? responseFormat.schema
      : undefined) || {
      type: 'object' as const,
      properties: {},
      required: [],
      additionalProperties: false as const,
    };
    const existingFields = schemaToFields(schema);

    return existingFields.length > 0
      ? existingFields
      : [createDefaultOutputSchemaField()];
  });

  const updateAgentField = async (
    input: Omit<UpdateOneAgentMutationVariables['input'], 'id'>,
  ) => {
    if (readonly || !workflowAiAgentActionAgent) {
      return;
    }

    const updatableStep = await getUpdatableWorkflowVersionStepOrThrow({
      stepId: action.id,
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
          ...input,
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

  if (isAgentBacked && !isDefined(workflowAiAgentActionAgent)) {
    return null;
  }

  const selectedModelId = isAgentBacked
    ? (workflowAiAgentActionAgent?.modelId ??
      AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID)
    : (modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID);
  const selectedModelConfiguration = isAgentBacked
    ? workflowAiAgentActionAgent?.modelConfiguration
    : modelConfiguration;

  const handleModelChange = async (newModelId: string) => {
    if (!isAgentBacked) {
      onModelIdChange(newModelId);

      return;
    }

    await updateAgentField({
      modelId: newModelId,
    });
  };

  const handleModelConfigurationChange = async (
    configuration: ModelConfiguration,
  ) => {
    if (!isAgentBacked) {
      onModelConfigurationChange(configuration);

      return;
    }

    await updateAgentField({
      modelConfiguration: configuration,
    });
  };

  const handleOutputSchemaChange = (updatedFields: OutputSchemaField[]) => {
    setOutputSchemaFields(updatedFields);
    onResponseSchemaChange(fieldsToSchema(updatedFields));
  };

  return (
    <>
      <AiModelPicker
        modelId={selectedModelId}
        onModelIdChange={handleModelChange}
        disabled={readonly}
      />

      {!isAgentBacked && (
        <FormTextFieldInput
          multiline
          label={t`Instructions`}
          placeholder={t`Describe the role of the AI and how it should do the task...`}
          defaultValue={instructions}
          onChange={onInstructionsChange}
          readonly={readonly}
        />
      )}

      <FormTextFieldInput
        multiline
        VariablePicker={WorkflowVariablePicker}
        label={t`Input (Prompt)`}
        placeholder={t`Describe what you want the AI to do...`}
        defaultValue={prompt}
        onChange={onPromptChange}
        readonly={readonly}
      />

      <FormTextFieldInput
        multiline
        label={t`Ask for human input`}
        placeholder={t`When should the agent stop and ask you? E.g. before sending any email or changing a deal's amount. Leave empty to never stop.`}
        defaultValue={humanInputInstructions}
        onChange={onHumanInputInstructionsChange}
        readonly={readonly}
      />

      {isAiChatInboxEnabled && (
        <>
          <FormSingleRecordPicker
            label={t`Recipient`}
            objectNameSingulars={[CoreObjectNameSingular.WorkspaceMember]}
            defaultValue={recipientWorkspaceMemberId}
            onChange={(workspaceMemberId) =>
              onRecipientChange(workspaceMemberId ?? undefined)
            }
            disabled={readonly}
            testId="workflow-edit-action-ai-agent-recipient"
            VariablePicker={WorkflowVariablePicker}
          />

          <WorkflowConversationFields
            dropdownId={`workflow-ai-agent-conversation-${action.id}`}
            conversation={conversation}
            defaultScope="STEP"
            description={t`With the recipient, or the workflow creator when empty. It stays out of their inbox until the agent needs them.`}
            readonly={readonly}
            onChange={onConversationChange}
          />
        </>
      )}

      <SettingsAgentModelCapabilities
        selectedModelId={selectedModelId}
        modelConfiguration={selectedModelConfiguration || {}}
        onConfigurationChange={handleModelConfigurationChange}
        disabled={readonly}
      />

      <AgentOutputSchemaBuilder
        fields={outputSchemaFields}
        onChange={handleOutputSchemaChange}
        readonly={readonly}
      />
    </>
  );
};

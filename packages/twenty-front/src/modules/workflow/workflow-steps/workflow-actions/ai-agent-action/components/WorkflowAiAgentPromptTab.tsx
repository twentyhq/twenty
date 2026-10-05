import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { type OutputSchemaField } from '@/ai/types/OutputSchemaField';
import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { agentResponseSchemaToOutputSchema } from '@/ai/utils/agentResponseSchemaToOutputSchema';
import { createDefaultOutputSchemaField } from '@/ai/utils/createDefaultOutputSchemaField';
import { fieldsToSchema } from '@/ai/utils/fieldsToSchema';
import { schemaToFields } from '@/ai/utils/schemaToFields';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowConversationFields } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowConversationFields';
import { WorkflowOutputSchemaBuilder } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowOutputSchemaBuilder';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  type AgentResponseSchema,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type WorkflowConversation } from 'twenty-shared/workflow';
import { useDebouncedCallback } from 'use-debounce';
import {
  UpdateOneAgentDocument,
  type UpdateOneAgentMutationVariables,
} from '~/generated-metadata/graphql';

type WorkflowAiAgentPromptTabProps = {
  action: WorkflowAiAgentAction;
  prompt: string;
  readonly: boolean;
  onPromptChange: (value: string) => void;
  humanInputInstructions: string;
  onHumanInputInstructionsChange: (value: string) => void;
  recipientWorkspaceMemberId: string | undefined;
  onRecipientChange: (workspaceMemberId: string | undefined) => void;
  conversation: WorkflowConversation | undefined;
  onConversationChange: (conversation: WorkflowConversation) => void;
  onActionUpdate?: (action: WorkflowAiAgentAction) => void;
};

export const WorkflowAiAgentPromptTab = ({
  action,
  prompt,
  readonly,
  onPromptChange,
  humanInputInstructions,
  onHumanInputInstructionsChange,
  recipientWorkspaceMemberId,
  onRecipientChange,
  conversation,
  onConversationChange,
  onActionUpdate,
}: WorkflowAiAgentPromptTabProps) => {
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const [updateAgent] = useMutation(UpdateOneAgentDocument);

  const [outputSchemaFields, setOutputSchemaFields] = useState<
    OutputSchemaField[]
  >(() => {
    const schema: AgentResponseSchema = workflowAiAgentActionAgent
      ?.responseFormat?.schema || {
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

    const response = await updateAgent({
      variables: {
        input: {
          id: workflowAiAgentActionAgent.id,
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

  const updateResponseSchema = async (schema: AgentResponseSchema) => {
    await updateAgentField({
      responseFormat: { type: 'json' as const, schema },
    });

    onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        outputSchema: agentResponseSchemaToOutputSchema(schema),
      },
    });
  };

  const debouncedUpdateResponseSchema = useDebouncedCallback(
    updateResponseSchema,
    300,
  );

  if (!workflowAiAgentActionAgent) {
    return null;
  }

  const agent = workflowAiAgentActionAgent;

  const handleModelChange = async (modelId: string) => {
    await updateAgentField({
      modelId,
    });
  };

  const handleModelConfigurationChange = async (
    configuration: ModelConfiguration,
  ) => {
    await updateAgentField({
      modelConfiguration: configuration,
    });
  };

  const handleOutputSchemaChange = (updatedFields: OutputSchemaField[]) => {
    setOutputSchemaFields(updatedFields);
    void debouncedUpdateResponseSchema(fieldsToSchema(updatedFields));
  };

  return (
    <>
      <AiModelPicker
        modelId={agent.modelId}
        onModelIdChange={handleModelChange}
        disabled={readonly}
      />

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

      <SettingsAgentModelCapabilities
        selectedModelId={agent.modelId}
        modelConfiguration={agent.modelConfiguration || {}}
        onConfigurationChange={handleModelConfigurationChange}
        disabled={readonly}
      />

      <WorkflowOutputSchemaBuilder
        fields={outputSchemaFields}
        onChange={handleOutputSchemaChange}
        readonly={readonly}
      />
    </>
  );
};

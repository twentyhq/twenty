import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { agentResponseSchemaToOutputSchema } from '@/ai/utils/agentResponseSchemaToOutputSchema';
import { createDefaultOutputSchemaField } from '@/ai/utils/createDefaultOutputSchemaField';
import { fieldsToSchema } from '@/ai/utils/fieldsToSchema';
import { schemaToFields } from '@/ai/utils/schemaToFields';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
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
  onActionUpdate?: (action: WorkflowAiAgentAction) => void;
};

export const WorkflowAiAgentPromptTab = ({
  action,
  prompt,
  readonly,
  onPromptChange,
  onActionUpdate,
}: WorkflowAiAgentPromptTabProps) => {
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const { options: aiModelOptions, pinnedOption } = useAiModelOptions({
    variant: 'pinned-default',
  });
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
      <Select
        label={t`Model`}
        dropdownId="select-agent-model"
        options={aiModelOptions}
        pinnedOption={pinnedOption}
        value={agent.modelId}
        onChange={handleModelChange}
        showContextualTextInControl={false}
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

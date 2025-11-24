import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import {
  type AgentResponseSchema,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { type SelectOption } from 'twenty-ui/input';
import { type Agent } from '~/generated-metadata/graphql';
import { SettingsAgentModelCapabilities } from '~/pages/settings/ai/components/SettingsAgentModelCapabilities';
import { SettingsAgentResponseFormat } from '~/pages/settings/ai/components/SettingsAgentResponseFormat';

type WorkflowAiAgentPromptTabProps = {
  agent?: Agent | null;
  readonly: boolean;
  aiModelOptions: SelectOption[];
  onPromptChange: (value: string) => void;
  onModelChange: (modelId: string) => void;
  onModelConfigurationChange: (configuration: ModelConfiguration) => void;
  onResponseFormatChange: (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => void;
};

export const WorkflowAiAgentPromptTab = ({
  agent,
  readonly,
  aiModelOptions,
  onPromptChange,
  onModelChange,
  onModelConfigurationChange,
  onResponseFormatChange,
}: WorkflowAiAgentPromptTabProps) => {
  return (
    <>
      <FormTextFieldInput
        multiline
        VariablePicker={WorkflowVariablePicker}
        label={t`Instructions for AI`}
        placeholder={t`Describe what you want the AI to do...`}
        defaultValue={agent?.prompt || ''}
        onChange={onPromptChange}
        readonly={readonly}
      />

      {agent ? (
        <>
          <Select
            dropdownId="select-agent-model"
            label={t`AI Model`}
            options={aiModelOptions}
            value={agent.modelId}
            onChange={onModelChange}
            disabled={readonly}
          />

          <SettingsAgentModelCapabilities
            selectedModelId={agent.modelId}
            modelConfiguration={agent.modelConfiguration || {}}
            onConfigurationChange={onModelConfigurationChange}
            disabled={readonly}
          />

          <SettingsAgentResponseFormat
            responseFormat={
              agent.responseFormat || { type: 'text', schema: {} }
            }
            onResponseFormatChange={onResponseFormatChange}
            disabled={readonly}
          />
        </>
      ) : null}
    </>
  );
};

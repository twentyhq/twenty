import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import {
  type AgentResponseSchema,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { type SelectOption } from 'twenty-ui/input';
import { SettingsAgentModelCapabilities } from '~/pages/settings/ai/components/SettingsAgentModelCapabilities';
import { SettingsAgentResponseFormat } from '~/pages/settings/ai/components/SettingsAgentResponseFormat';

type WorkflowAiAgentPromptTabProps = {
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
  readonly,
  aiModelOptions,
  onPromptChange,
  onModelChange,
  onModelConfigurationChange,
  onResponseFormatChange,
}: WorkflowAiAgentPromptTabProps) => {
  const workflowAiAgentActionAgent = useRecoilValue(
    workflowAiAgentActionAgentState,
  );
  return (
    <>
      <FormTextFieldInput
        multiline
        VariablePicker={WorkflowVariablePicker}
        label={t`Instructions for AI`}
        placeholder={t`Describe what you want the AI to do...`}
        defaultValue={workflowAiAgentActionAgent?.prompt || ''}
        onChange={onPromptChange}
        readonly={readonly}
      />

      {workflowAiAgentActionAgent ? (
        <>
          <Select
            dropdownId="select-agent-model"
            label={t`AI Model`}
            options={aiModelOptions}
            value={workflowAiAgentActionAgent.modelId}
            onChange={onModelChange}
            disabled={readonly}
          />

          <SettingsAgentModelCapabilities
            selectedModelId={workflowAiAgentActionAgent.modelId}
            modelConfiguration={
              workflowAiAgentActionAgent.modelConfiguration || {}
            }
            onConfigurationChange={onModelConfigurationChange}
            disabled={readonly}
          />

          <SettingsAgentResponseFormat
            responseFormat={
              workflowAiAgentActionAgent.responseFormat || {
                type: 'text',
                schema: {},
              }
            }
            onResponseFormatChange={onResponseFormatChange}
            disabled={readonly}
          />
        </>
      ) : null}
    </>
  );
};

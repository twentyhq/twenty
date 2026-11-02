import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { WorkflowAiAgentOutputFormatField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentOutputFormatField';
import { WorkflowAiAgentPromptField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPromptField';
import { type WorkflowAiAgentStepPanelProps } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepPanelProps';
import { t } from '@lingui/core/macro';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';

type WorkflowAiAgentGenerateStepPromptTabProps = WorkflowAiAgentStepPanelProps;

export const WorkflowAiAgentGenerateStepPromptTab = ({
  input,
  readonly,
  onInputChange,
}: WorkflowAiAgentGenerateStepPromptTabProps) => {
  const selectedModelId =
    input.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID;

  return (
    <>
      <AiModelPicker
        modelId={selectedModelId}
        onModelIdChange={(modelId) => onInputChange({ modelId })}
        disabled={readonly}
      />

      <FormTextFieldInput
        multiline
        label={t`Instructions`}
        placeholder={t`Describe the role of the AI and how it should do the task...`}
        defaultValue={input.instructions ?? ''}
        onChange={(instructions) => onInputChange({ instructions })}
        readonly={readonly}
      />

      <WorkflowAiAgentPromptField
        prompt={input.prompt}
        hint={t`Required: the message the AI receives on each run.`}
        readonly={readonly}
        onPromptChange={(prompt) => onInputChange({ prompt })}
      />

      <SettingsAgentModelCapabilities
        selectedModelId={selectedModelId}
        modelConfiguration={input.modelConfiguration ?? {}}
        onConfigurationChange={(modelConfiguration) =>
          onInputChange({ modelConfiguration })
        }
        disabled={readonly}
      />

      <WorkflowAiAgentOutputFormatField
        responseFormat={input.responseFormat}
        readonly={readonly}
        onResponseFormatChange={(responseFormat) =>
          onInputChange({ responseFormat })
        }
      />
    </>
  );
};

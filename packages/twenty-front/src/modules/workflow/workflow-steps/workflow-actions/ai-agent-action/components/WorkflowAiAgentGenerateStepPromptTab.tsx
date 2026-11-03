import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { WorkflowAiAgentOutputFormatField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentOutputFormatField';
import { WorkflowAiAgentPromptField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPromptField';
import { type WorkflowAiAgentStepPanelProps } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepPanelProps';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';

type WorkflowAiAgentGenerateStepPromptTabProps = WorkflowAiAgentStepPanelProps;

export const WorkflowAiAgentGenerateStepPromptTab = ({
  input,
  readonly,
  onInputChange,
}: WorkflowAiAgentGenerateStepPromptTabProps) => {
  const selectedModelId =
    input.modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID;
  // decided once, so clearing the instructions does not remove the field being edited
  const [hasInstructionsField] = useState(() =>
    isNonEmptyString(input.instructions),
  );

  return (
    <>
      <AiModelPicker
        modelId={selectedModelId}
        onModelIdChange={(modelId) => onInputChange({ modelId })}
        disabled={readonly}
      />

      {hasInstructionsField && (
        <FormTextFieldInput
          multiline
          label={t`Instructions`}
          placeholder={t`Describe the role of the AI and how it should do the task...`}
          defaultValue={input.instructions ?? ''}
          onChange={(instructions) => onInputChange({ instructions })}
          readonly={readonly}
        />
      )}

      <WorkflowAiAgentPromptField
        prompt={input.prompt}
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

import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { WorkflowAiAgentOutputFormatField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentOutputFormatField';
import { WorkflowAiAgentConversationFields } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentConversationFields';
import { WorkflowAiAgentPromptField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPromptField';
import { WorkflowAiAgentStepAgentField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentStepAgentField';
import { type WorkflowAiAgentStepPanelProps } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepPanelProps';

type WorkflowAiAgentAgentStepPromptTabProps = WorkflowAiAgentStepPanelProps & {
  agent: FlatAgent;
};

export const WorkflowAiAgentAgentStepPromptTab = ({
  agent,
  stepId,
  input,
  readonly,
  onInputChange,
}: WorkflowAiAgentAgentStepPromptTabProps) => (
  <>
    <WorkflowAiAgentStepAgentField agent={agent} />

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

    <WorkflowAiAgentOutputFormatField
      responseFormat={input.responseFormat ?? agent.responseFormat}
      readonly={readonly}
      onResponseFormatChange={(responseFormat) =>
        onInputChange({ responseFormat })
      }
    />
  </>
);

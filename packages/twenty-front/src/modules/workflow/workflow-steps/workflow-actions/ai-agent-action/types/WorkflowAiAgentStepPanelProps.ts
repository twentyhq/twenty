import { type WorkflowAiAgentStepInput } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepInput';

export type WorkflowAiAgentStepPanelProps = {
  stepId: string;
  input: WorkflowAiAgentStepInput;
  readonly: boolean;
  onInputChange: (inputUpdate: Partial<WorkflowAiAgentStepInput>) => void;
};

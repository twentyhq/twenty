import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type ToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-history/types/tool-call-workflow-step.type';

// the caller is written on pending calls in the shape answers already read
export const mapAgentRunCallerToToolCallWorkflowStep = (
  caller: AgentRunCaller,
): ToolCallWorkflowStep => ({
  workflowRunId: caller.ref.workflowRunId,
  stepId: caller.ref.stepId,
});

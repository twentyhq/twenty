import { type AgentRunEvent } from 'twenty-shared/application';

export const buildAgentRunToolResultEvent = ({
  toolCallId,
  output,
  isError,
}: {
  toolCallId: string;
  output: unknown;
  isError: boolean;
}): AgentRunEvent => ({
  id: `tool_result:${toolCallId}`,
  type: 'agent.tool_result',
  toolUseId: toolCallId,
  output,
  isError,
});

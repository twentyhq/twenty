import { type AgentRunEvent } from 'twenty-shared/application';

export const buildAgentRunToolUseEvent = ({
  toolCallId,
  name,
  input,
}: {
  toolCallId: string;
  name: string;
  input: unknown;
}): AgentRunEvent => ({
  id: `tool_use:${toolCallId}`,
  type: 'agent.tool_use',
  toolUseId: toolCallId,
  name,
  input,
});

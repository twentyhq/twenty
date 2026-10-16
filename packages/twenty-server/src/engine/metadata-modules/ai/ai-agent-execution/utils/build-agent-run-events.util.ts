import { type AgentRunEvent } from 'twenty-shared/application';

type AgentRunStatusEvent = Extract<
  AgentRunEvent,
  { type: 'session.status_running' | 'session.status_idle' | 'session.error' }
>;

// distributes over the union, which a plain Omit would merge into one member
type AgentRunStatus<TStatusEvent = AgentRunStatusEvent> =
  TStatusEvent extends AgentRunStatusEvent ? Omit<TStatusEvent, 'id'> : never;

const STATUS_EVENT_ID_SUFFIXES: Record<AgentRunStatusEvent['type'], string> = {
  'session.status_running': 'running',
  'session.status_idle': 'idle',
  'session.error': 'error',
};

export const buildAgentRunMessageEvent = ({
  messageId,
  role,
  textIndex,
  text,
}: {
  messageId: string;
  role: 'user' | 'assistant';
  textIndex: number;
  text: string;
}): AgentRunEvent => {
  const id = `${messageId}:text:${textIndex}`;
  const content = [{ type: 'text' as const, text }];

  return role === 'user'
    ? { id, type: 'user.message', content }
    : { id, type: 'agent.message', content };
};

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

// sourceId names the turn or reply the status is about, so the same status keeps its id
export const buildAgentRunStatusEvent = ({
  sourceId,
  status,
}: {
  sourceId: string;
  status: AgentRunStatus;
}): AgentRunEvent => ({
  ...status,
  id: `${sourceId}:${STATUS_EVENT_ID_SUFFIXES[status.type]}`,
});

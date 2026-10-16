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

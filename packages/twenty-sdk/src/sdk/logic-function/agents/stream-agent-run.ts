import { createClient } from 'graphql-sse';
import { type AgentRunEvent } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AgentRunThreadReference } from '@/sdk/logic-function/agents/list-agent-run-events';
import { getApplicationApiConfigOrThrow } from '@/sdk/logic-function/utils/get-application-api-config-or-throw.util';

const ON_AGENT_RUN_EVENT_SUBSCRIPTION = `
  subscription OnAgentRunEvent($agentUniversalIdentifier: UUID!, $threadKey: String!) {
    onAgentRunEvent(
      agentUniversalIdentifier: $agentUniversalIdentifier
      threadKey: $threadKey
    ) {
      threadId
      event
    }
  }
`;

export type StreamAgentRunInput = AgentRunThreadReference & {
  signal?: AbortSignal;
};

const isRunSettledEvent = (event: AgentRunEvent): boolean =>
  event.type === 'session.status_idle' || event.type === 'session.error';

// Follows the conversation live until the run goes idle or fails. A subscriber joining mid-turn
// first gets that turn so far; a run that settled before it joined is read with listAgentRunEvents
export async function* streamAgentRun({
  agentUniversalIdentifier,
  threadKey,
  signal,
}: StreamAgentRunInput): AsyncIterable<AgentRunEvent> {
  const { apiUrl, accessToken } =
    getApplicationApiConfigOrThrow('streamAgentRun');

  if (signal?.aborted === true) {
    return;
  }

  const client = createClient({
    url: `${apiUrl}/metadata`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const results = client.iterate<{
    onAgentRunEvent: { threadId: string; event: AgentRunEvent | null };
  }>({
    query: ON_AGENT_RUN_EVENT_SUBSCRIPTION,
    variables: { agentUniversalIdentifier, threadKey },
  });
  const stop = () => {
    void results.return?.();
  };

  signal?.addEventListener('abort', stop, { once: true });

  try {
    for await (const { data, errors } of results) {
      if (isDefined(errors) && errors.length > 0) {
        throw new Error(
          `streamAgentRun() failed: ${errors.map((error) => error.message).join(', ')}`,
        );
      }

      // a keepalive carries no event
      const event = data?.onAgentRunEvent.event;

      if (!isDefined(event)) {
        continue;
      }

      yield event;

      if (isRunSettledEvent(event)) {
        return;
      }
    }
  } finally {
    signal?.removeEventListener('abort', stop);
    client.dispose();
  }
}

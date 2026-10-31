import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentConversationInput } from '@/sdk/logic-function/agents/types/agent-conversation.type';
import { getApplicationApiConfigOrThrow } from '@/sdk/logic-function/utils/get-application-api-config-or-throw.util';

const ON_AGENT_CHAT_EVENT_SUBSCRIPTION = `
  subscription OnAgentChatEvent($agentUniversalIdentifier: UUID!, $threadKey: String!) {
    onAgentChatEvent(agentUniversalIdentifier: $agentUniversalIdentifier, threadKey: $threadKey) {
      event
    }
  }
`;

export type StreamConversationInput = AgentConversationInput & {
  signal?: AbortSignal;
};

type SubscriptionResult = {
  data?: { onAgentChatEvent: { event: AgentChatSubscriptionEvent } } | null;
  errors?: { message: string }[];
};

// GraphQL over server-sent events: one `next` event per result, then `complete`
const parseServerSentEvent = (
  block: string,
): SubscriptionResult | 'complete' | null => {
  const lines = block.split('\n');

  if (lines.includes('event: complete')) {
    return 'complete';
  }

  const data = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())
    .join('\n');

  return data.length > 0 ? (JSON.parse(data) as SubscriptionResult) : null;
};

// the chat's own live events; the stream stays open until `signal` aborts or the loop breaks
export async function* streamConversation({
  signal,
  ...conversation
}: StreamConversationInput): AsyncGenerator<AgentChatSubscriptionEvent> {
  const { apiUrl, accessToken } =
    getApplicationApiConfigOrThrow('streamConversation');

  if (signal?.aborted) {
    return;
  }

  const response = await fetch(`${apiUrl}/metadata`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: ON_AGENT_CHAT_EVENT_SUBSCRIPTION,
      variables: conversation,
    }),
    signal,
  });

  if (!response.ok || !isDefined(response.body)) {
    throw new Error(
      `streamConversation() failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      // the server completes every stream it ends, so this is a dropped connection
      if (done) {
        throw new Error(
          'streamConversation() failed: the stream closed early; read the history and stream again to resume',
        );
      }

      buffer += value.replace(/\r\n/g, '\n');

      let boundary = buffer.indexOf('\n\n');

      while (boundary !== -1) {
        const result = parseServerSentEvent(buffer.slice(0, boundary));

        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');

        if (result === 'complete') {
          return;
        }

        // isNonEmptyArray would inline twenty-shared's utils chunk into every logic function
        if (isDefined(result?.errors)) {
          throw new Error(
            `streamConversation() failed: ${result.errors.map((error) => error.message).join(', ')}`,
          );
        }

        if (isDefined(result?.data?.onAgentChatEvent)) {
          yield result.data.onAgentChatEvent.event;
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }

    throw error;
  } finally {
    await reader.cancel().catch(() => {});
  }
}

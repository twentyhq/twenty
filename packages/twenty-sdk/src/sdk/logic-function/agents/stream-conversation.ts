import { isArray, isNonEmptyString, isObject, isString } from '@sniptt/guards';
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

type ServerSentEvent =
  | { type: 'complete' }
  | { type: 'errors'; messages: string[] }
  | { type: 'event'; event: AgentChatSubscriptionEvent }
  | null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isObject(value);

const isAgentChatSubscriptionEvent = (
  value: unknown,
): value is AgentChatSubscriptionEvent =>
  isRecord(value) && isString(value.type);

// GraphQL over server-sent events: one `next` event per result, then `complete`
const parseServerSentEvent = (block: string): ServerSentEvent => {
  const lines = block.split('\n');

  if (lines.includes('event: complete')) {
    return { type: 'complete' };
  }

  const data = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())
    .join('\n');

  if (!isNonEmptyString(data)) {
    return null;
  }

  const result: unknown = JSON.parse(data);

  if (!isRecord(result)) {
    throw new Error(`streamConversation() failed: unexpected result ${data}`);
  }

  // isNonEmptyArray would inline twenty-shared's utils chunk into every logic function
  if (isArray(result.errors)) {
    return {
      type: 'errors',
      messages: result.errors.map((error) =>
        isRecord(error) && isString(error.message)
          ? error.message
          : JSON.stringify(error),
      ),
    };
  }

  if (
    !isRecord(result.data) ||
    !isRecord(result.data.onAgentChatEvent) ||
    !isAgentChatSubscriptionEvent(result.data.onAgentChatEvent.event)
  ) {
    throw new Error(`streamConversation() failed: unexpected result ${data}`);
  }

  return { type: 'event', event: result.data.onAgentChatEvent.event };
};

export async function* streamConversation({
  signal,
  ...conversation
}: StreamConversationInput): AsyncGenerator<AgentChatSubscriptionEvent> {
  const { apiUrl, accessToken } =
    getApplicationApiConfigOrThrow('streamConversation');
  let reader: ReadableStreamDefaultReader<string> | undefined;

  if (signal?.aborted) {
    return;
  }

  try {
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

    reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';

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
        const serverSentEvent = parseServerSentEvent(buffer.slice(0, boundary));

        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');

        if (serverSentEvent?.type === 'complete') {
          return;
        }

        if (serverSentEvent?.type === 'errors') {
          throw new Error(
            `streamConversation() failed: ${serverSentEvent.messages.join(', ')}`,
          );
        }

        if (serverSentEvent?.type === 'event') {
          yield serverSentEvent.event;
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }

    throw error;
  } finally {
    await reader?.cancel().catch(() => {});
  }
}

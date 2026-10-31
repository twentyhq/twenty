import { isArray, isNonEmptyString, isObject, isString } from '@sniptt/guards';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { getApplicationApiConfigOrThrow } from '@/sdk/logic-function/utils/get-application-api-config-or-throw.util';

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
const parseServerSentEventOrThrow = (
  block: string,
  caller: string,
): ServerSentEvent => {
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
    throw new Error(`${caller}() failed: unexpected result ${data}`);
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
    throw new Error(`${caller}() failed: unexpected result ${data}`);
  }

  return { type: 'event', event: result.data.onAgentChatEvent.event };
};

// yields the events of an onAgentChatEvent subscription; an abort ends it quietly, a dropped connection throws
export async function* streamAgentChatEvents({
  query,
  variables,
  caller,
  signal,
}: {
  query: string;
  variables: Record<string, unknown>;
  caller: string;
  signal?: AbortSignal;
}): AsyncGenerator<AgentChatSubscriptionEvent> {
  const { apiUrl, accessToken } = getApplicationApiConfigOrThrow(caller);
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
      body: JSON.stringify({ query, variables }),
      signal,
    });

    if (!response.ok || !isDefined(response.body)) {
      throw new Error(
        `${caller}() failed: HTTP ${response.status} ${response.statusText}`,
      );
    }

    reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      // the server completes every stream it ends, so this is a dropped connection
      if (done) {
        throw new Error(`${caller}() failed: the stream closed early`);
      }

      buffer += value.replace(/\r\n/g, '\n');

      let boundary = buffer.indexOf('\n\n');

      while (boundary !== -1) {
        const serverSentEvent = parseServerSentEventOrThrow(
          buffer.slice(0, boundary),
          caller,
        );

        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');

        if (serverSentEvent?.type === 'complete') {
          return;
        }

        if (serverSentEvent?.type === 'errors') {
          throw new Error(
            `${caller}() failed: ${serverSentEvent.messages.join(', ')}`,
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

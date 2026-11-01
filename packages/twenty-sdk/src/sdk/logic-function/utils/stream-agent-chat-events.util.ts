import {
  isArray,
  isBoolean,
  isNonEmptyString,
  isNumber,
  isObject,
  isString,
} from '@sniptt/guards';
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

const toErrorMessages = (errors: unknown[]): string[] =>
  errors.map((error) =>
    isRecord(error) && isString(error.message)
      ? error.message
      : JSON.stringify(error),
  );

const isReactionSummary = (reaction: unknown): boolean =>
  isRecord(reaction) &&
  isString(reaction.emoji) &&
  isArray(reaction.workspaceMemberIds) &&
  reaction.workspaceMemberIds.every(isString) &&
  isArray(reaction.agentIds) &&
  reaction.agentIds.every(isString) &&
  isBoolean(reaction.hasAssistantReacted);

const HAS_EVENT_FIELDS: Record<
  AgentChatSubscriptionEvent['type'],
  (event: Record<string, unknown>) => boolean
> = {
  'stream-chunk': ({ chunk, seq }) =>
    isRecord(chunk) && (seq === undefined || isNumber(seq)),
  'message-persisted': ({ messageId }) => isString(messageId),
  'message-added': ({ messageId }) => isString(messageId),
  'queue-updated': () => true,
  'tool-call-resolved': ({ toolCallId }) => isString(toolCallId),
  'message-reactions-updated': ({ messageId, reactions, revision }) =>
    isString(messageId) &&
    isArray(reactions) &&
    reactions.every(isReactionSummary) &&
    isNumber(revision),
  'stream-error': ({ code, message }) => isString(code) && isString(message),
  'credits-exhausted': () => true,
  'user-credits-exhausted': ({
    workspaceMemberId,
    isFallingBackToWorkspaceCredits,
    renewsAt,
  }) =>
    isString(workspaceMemberId) &&
    isBoolean(isFallingBackToWorkspaceCredits) &&
    isString(renewsAt),
  keepalive: () => true,
};

const isKnownEventType = (
  type: string,
): type is AgentChatSubscriptionEvent['type'] =>
  Object.prototype.hasOwnProperty.call(HAS_EVENT_FIELDS, type);

const isAgentChatSubscriptionEvent = (
  event: Record<string, unknown>,
): event is AgentChatSubscriptionEvent =>
  isString(event.type) &&
  isKnownEventType(event.type) &&
  HAS_EVENT_FIELDS[event.type](event);

// GraphQL over server-sent events: one `next` event per result, then `complete`
const parseServerSentEventOrThrow = ({
  block,
  caller,
}: {
  block: string;
  caller: string;
}): ServerSentEvent => {
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
    return { type: 'errors', messages: toErrorMessages(result.errors) };
  }

  const event =
    isRecord(result.data) && isRecord(result.data.onAgentChatEvent)
      ? result.data.onAgentChatEvent.event
      : undefined;

  if (!isRecord(event) || !isString(event.type)) {
    throw new Error(`${caller}() failed: unexpected result ${data}`);
  }

  // an event a newer server added is skipped rather than failing the stream
  if (!isKnownEventType(event.type)) {
    return null;
  }

  if (!isAgentChatSubscriptionEvent(event)) {
    throw new Error(`${caller}() failed: unexpected result ${data}`);
  }

  return { type: 'event', event };
};

const readFailedResponseMessage = async (response: Response) => {
  const body: unknown = await response.json().catch(() => undefined);

  if (isRecord(body) && isArray(body.errors)) {
    return toErrorMessages(body.errors).join(', ');
  }

  return `HTTP ${response.status} ${response.statusText}`;
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
        `${caller}() failed: ${await readFailedResponseMessage(response)}`,
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

      // a CRLF can be split across two reads
      buffer = (buffer + value).replace(/\r\n/g, '\n');

      let boundary = buffer.indexOf('\n\n');

      while (boundary !== -1) {
        const serverSentEvent = parseServerSentEventOrThrow({
          block: buffer.slice(0, boundary),
          caller,
        });

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
    // an abort rejects with the signal's reason, which is not always an AbortError
    if (signal?.aborted) {
      return;
    }

    throw error;
  } finally {
    await reader?.cancel().catch(() => {});
  }
}

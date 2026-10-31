import {
  type AiRunEvent,
  type AiRunEventsInput,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AI_RUN_EVENT_FIELDS } from '@/sdk/logic-function/ai/ai-run-event-fields.constant';
import { getApplicationApiConfigOrThrow } from '@/sdk/logic-function/utils/get-application-api-config-or-throw.util';

const ON_AI_RUN_EVENT_SUBSCRIPTION = `
  subscription OnAiRunEvent($runId: UUID, $agentUniversalIdentifier: UUID, $threadKey: String, $after: String) {
    onAiRunEvent(runId: $runId, agentUniversalIdentifier: $agentUniversalIdentifier, threadKey: $threadKey, after: $after) {
      ${AI_RUN_EVENT_FIELDS}
    }
  }
`;

export type StreamRunInput = AiRunEventsInput & { signal?: AbortSignal };

type SubscriptionResult = {
  data?: { onAiRunEvent: AiRunEvent } | null;
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

// Yields the events after `after`, then live ones. A run's stream ends with the run, a
// conversation's when `signal` aborts or the loop breaks
export async function* streamRun({
  signal,
  ...variables
}: StreamRunInput): AsyncGenerator<AiRunEvent> {
  const { apiUrl, accessToken } = getApplicationApiConfigOrThrow('streamRun');

  if (signal?.aborted === true) {
    return;
  }

  const response = await fetch(`${apiUrl}/metadata`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: ON_AI_RUN_EVENT_SUBSCRIPTION, variables }),
    signal,
  });

  if (!response.ok || response.body === null) {
    throw new Error(
      `streamRun() failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        return;
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

        if (isNonEmptyArray(result?.errors)) {
          throw new Error(
            `streamRun() failed: ${result.errors.map((error) => error.message).join(', ')}`,
          );
        }

        if (isDefined(result?.data?.onAiRunEvent)) {
          yield result.data.onAiRunEvent;
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

import { isString } from '@sniptt/guards';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import {
  type GenerateInput,
  type GenerateResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';
import { streamAgentChatEvents } from '@/sdk/logic-function/utils/stream-agent-chat-events.util';
import { toRunAgentMessages } from '@/sdk/logic-function/utils/to-run-agent-messages.util';

const GENERATE_MUTATION = `
  mutation Generate($input: GenerateInput!) {
    generate(input: $input) {
      success
      text
      object
      error
      runId
      usage {
        inputTokens
        outputTokens
      }
    }
  }
`;

const ON_AGENT_RUN_EVENT_SUBSCRIPTION = `
  subscription OnAgentRunEvent($runId: UUID!) {
    onAgentChatEvent(runId: $runId) {
      event
    }
  }
`;

const END_EVENT_GRACE_MS = 5_000;

type GenerateVariables = {
  input: Omit<GenerateInput, 'input' | 'onChunk' | 'signal'> & {
    input: ReturnType<typeof toRunAgentMessages>;
  };
};

const requestGenerate = async ({
  variables,
  signal,
}: {
  variables: GenerateVariables;
  signal: AbortSignal | undefined;
}): Promise<GenerateResult> => {
  const { generate: result } = await postGraphqlRequest<
    GenerateVariables,
    { generate: GenerateResult }
  >({
    query: GENERATE_MUTATION,
    variables,
    caller: 'ai.generate',
    signal,
  });

  return result;
};

type UIMessageChunk = Parameters<NonNullable<GenerateInput['onChunk']>>[0];

// the run channel carries the AI SDK's own chunks, so one that names its type is taken as one
const isUIMessageChunk = (
  chunk: Record<string, unknown>,
): chunk is UIMessageChunk => isString(chunk.type);

const isRunEnd = ({ type }: Pick<AgentChatSubscriptionEvent, 'type'>) =>
  type === 'message-persisted' ||
  type === 'credits-exhausted' ||
  type === 'stream-error';

// Starts the run once its channel is live (the first keepalive). Chunks are read off the network ahead of
// a slow onChunk, so the grace after the result only waits for a lost end event, and every chunk read is delivered
const generateWithChunks = async ({
  variables,
  onChunk,
  signal,
}: {
  variables: GenerateVariables;
  onChunk: NonNullable<GenerateInput['onChunk']>;
  signal: AbortSignal | undefined;
}): Promise<GenerateResult> => {
  const runId = variables.input.runId ?? crypto.randomUUID();
  const stopFollowing = new AbortController();
  const runSignal = isDefined(signal)
    ? AbortSignal.any([signal, stopFollowing.signal])
    : stopFollowing.signal;
  let removeAbortListener = () => {};
  const callerAborted = new Promise<never>((_resolve, reject) => {
    if (!isDefined(signal)) {
      return;
    }

    const rejectWithReason = () => reject(signal.reason);

    signal.addEventListener('abort', rejectWithReason, { once: true });
    removeAbortListener = () =>
      signal.removeEventListener('abort', rejectWithReason);
  });

  void callerAborted.catch(() => undefined);

  try {
    const events = streamAgentChatEvents({
      query: ON_AGENT_RUN_EVENT_SUBSCRIPTION,
      variables: { runId },
      caller: 'ai.generate',
      signal: runSignal,
    });

    if ((await events.next()).done) {
      signal?.throwIfAborted();

      throw new Error('ai.generate() failed: the stream ended before the run');
    }

    const receivedChunks: UIMessageChunk[] = [];
    let isReceiving = true;
    let hasResult = false;
    let wakeDelivery = () => {};

    const received = (async () => {
      try {
        for await (const event of events) {
          if (event.type === 'stream-chunk' && isUIMessageChunk(event.chunk)) {
            receivedChunks.push(event.chunk);
            wakeDelivery();
          }

          if (isRunEnd(event)) {
            return;
          }
        }
      } finally {
        isReceiving = false;
        wakeDelivery();
      }
    })();

    const delivered = (async () => {
      while (!signal?.aborted) {
        const chunk = receivedChunks.shift();

        if (isDefined(chunk)) {
          await onChunk(chunk);
          continue;
        }

        // once the result is in, a failing channel only ends the reading: the run is done and billed
        if (!isReceiving) {
          return hasResult ? undefined : received;
        }

        await new Promise<void>((resolve) => {
          wakeDelivery = resolve;
        });
      }
    })();

    void received.catch(() => undefined);
    void delivered.catch(() => undefined);

    const generated = requestGenerate({
      variables: { input: { ...variables.input, runId } },
      signal: runSignal,
    });

    // a failing onChunk rejects at once, while delivering every chunk still waits for the result
    const result = await Promise.race([
      generated,
      delivered.then(() => generated),
    ]);

    hasResult = true;

    // the result is final, so a lost end event only stops the wait for more chunks; a failing onChunk still rejects at once
    let endEventGraceTimer: ReturnType<typeof setTimeout> | undefined;

    await Promise.race([
      received.catch(() => undefined),
      delivered,
      new Promise((resolve) => {
        endEventGraceTimer = setTimeout(resolve, END_EVENT_GRACE_MS);
      }),
    ]).finally(() => clearTimeout(endEventGraceTimer));

    stopFollowing.abort();
    // the caller's abort settles the call even while an onChunk is still running
    await Promise.race([delivered, callerAborted]);

    // the reader ends quietly on abort, so an abort after the mutation returned would read as a full delivery
    signal?.throwIfAborted();

    return result;
  } finally {
    removeAbortListener();
    stopFollowing.abort();
  }
};

export const ai = {
  // runs as the function's caller; with no scope it gets no data tools, and a scope only narrows the caller
  generate: async ({
    input,
    onChunk,
    signal,
    ...rest
  }: GenerateInput): Promise<GenerateResult> => {
    const variables = { input: { ...rest, input: toRunAgentMessages(input) } };

    return isDefined(onChunk)
      ? generateWithChunks({ variables, onChunk, signal })
      : requestGenerate({ variables, signal });
  },
};

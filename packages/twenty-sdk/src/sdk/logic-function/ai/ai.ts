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

// starts the run once its channel is live (the first keepalive), and ends at the end event after its last chunk
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

    const deliverChunks = async () => {
      for await (const event of events) {
        if (event.type === 'stream-chunk') {
          await onChunk(event.chunk);
        }

        if (
          event.type === 'message-persisted' ||
          event.type === 'credits-exhausted' ||
          event.type === 'stream-error'
        ) {
          return;
        }
      }
    };

    const delivered = deliverChunks();
    const generated = requestGenerate({
      variables: { input: { ...variables.input, runId } },
      signal: runSignal,
    });

    void delivered.catch(() => undefined);

    // a failing onChunk rejects at once, while delivering every chunk still waits for the result
    const result = await Promise.race([
      generated,
      delivered.then(() => generated),
    ]);

    // the result is final, so a lost end event only cuts the stream short instead of blocking forever
    let endEventGraceTimer: ReturnType<typeof setTimeout> | undefined;

    await Promise.race([
      delivered,
      new Promise((resolve) => {
        endEventGraceTimer = setTimeout(resolve, END_EVENT_GRACE_MS);
      }),
    ]).finally(() => clearTimeout(endEventGraceTimer));

    // the reader ends quietly on abort, so an abort after the mutation returned would read as a full delivery
    signal?.throwIfAborted();

    return result;
  } finally {
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

import { isString } from '@sniptt/guards';
import {
  type AgentResponseFormat,
  type AiRunScope,
  isAgentChatTurnEndEvent,
} from 'twenty-shared/ai';
import {
  type GenerateResult,
  type RunAgentMessage,
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

// an AI SDK UIMessageChunk, typed without the ai package
export type GenerateChunk = { type: string } & Record<string, unknown>;

export type GenerateInput = {
  // a string is sent as one user message
  input: string | RunAgentMessage[];
  instructions?: string | null;
  // the workspace default model when unset
  modelId?: string | null;
  responseFormat?: AgentResponseFormat | null;
  // no data tools when unset
  scope?: AiRunScope | null;
  onChunk?: (chunk: GenerateChunk) => void | Promise<void>;
  signal?: AbortSignal;
};

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
    input: RunAgentMessage[];
    runId?: string;
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
    isActingAsCaller: true,
  });

  return result;
};

// the run channel carries the AI SDK's own chunks, so one that names its type is taken as one
const isGenerateChunk = (
  chunk: Record<string, unknown>,
): chunk is GenerateChunk => isString(chunk.type);

// resolves undefined once the result is in and no event came for the grace, so a lost end event stops the wait
const waitForQuietAfterResult = (generated: Promise<GenerateResult>) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let isWaiting = true;
  const quiet = new Promise<undefined>((resolve) => {
    void generated.then(
      () => {
        if (isWaiting) {
          timer = setTimeout(() => resolve(undefined), END_EVENT_GRACE_MS);
        }
      },
      () => undefined,
    );
  });

  return {
    quiet,
    stop: () => {
      isWaiting = false;
      clearTimeout(timer);
    },
  };
};

// Starts the run once its channel is live (the first keepalive), and reads the channel no faster than onChunk
// takes its chunks. The run is billed whatever happens to the channel, so a failing channel only stops the reading
const generateWithChunks = async ({
  variables,
  onChunk,
  signal,
}: {
  variables: GenerateVariables;
  onChunk: NonNullable<GenerateInput['onChunk']>;
  signal: AbortSignal | undefined;
}): Promise<GenerateResult> => {
  const runId = crypto.randomUUID();
  const stopFollowing = new AbortController();
  const runSignal = isDefined(signal)
    ? AbortSignal.any([signal, stopFollowing.signal])
    : stopFollowing.signal;
  // settles the call on abort even while an onChunk is still running
  const callerAborted = new Promise<never>((_resolve, reject) =>
    signal?.addEventListener('abort', () => reject(signal.reason), {
      once: true,
      signal: stopFollowing.signal,
    }),
  );

  void callerAborted.catch(() => undefined);

  try {
    const events = streamAgentChatEvents({
      query: ON_AGENT_RUN_EVENT_SUBSCRIPTION,
      variables: { runId },
      caller: 'ai.generate',
      signal: runSignal,
      // the same token as the mutation, so both reach the run as one caller
      isActingAsCaller: true,
    });

    if ((await events.next()).done) {
      signal?.throwIfAborted();

      throw new Error('ai.generate() failed: the stream ended before the run');
    }

    const generated = requestGenerate({
      variables: { input: { ...variables.input, runId } },
      signal: runSignal,
    });

    const deliverChunks = async () => {
      // only a chunk restarts the grace, since keepalives keep coming after the result
      let wait = waitForQuietAfterResult(generated);

      try {
        for (;;) {
          const next = await Promise.race([events.next(), wait.quiet]).catch(
            () => undefined,
          );

          if (
            !isDefined(next) ||
            next.done ||
            runSignal.aborted ||
            isAgentChatTurnEndEvent(next.value)
          ) {
            return;
          }

          if (
            next.value.type === 'stream-chunk' &&
            isGenerateChunk(next.value.chunk)
          ) {
            wait.stop();
            await onChunk(next.value.chunk);
            wait = waitForQuietAfterResult(generated);
          }
        }
      } finally {
        wait.stop();
        // a read left pending settles once following stops, so the channel closes without waiting on it
        void events.return(undefined).catch(() => undefined);
      }
    };

    const [result] = await Promise.race([
      Promise.all([generated, deliverChunks()]),
      callerAborted,
    ]);

    // the reader ends quietly on abort, so an abort after the result would read as a full delivery
    signal?.throwIfAborted();

    return result;
  } finally {
    stopFollowing.abort();
  }
};

export const ai = {
  // runs as the function's caller, like the default clients; with no scope it gets no data tools, and a scope only narrows the caller
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

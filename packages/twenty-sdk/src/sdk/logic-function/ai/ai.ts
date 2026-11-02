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

// Starts the run once its channel is live (the first keepalive). The channel is read no faster than onChunk
// takes its chunks, and the grace after the result only counts time spent waiting for the next event
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
      // the same token as the mutation, so both reach the run as one caller
      isActingAsCaller: true,
    });

    if ((await events.next()).done) {
      signal?.throwIfAborted();

      throw new Error('ai.generate() failed: the stream ended before the run');
    }

    let onChunkFailure: { error: unknown } | undefined;
    let isDelivering = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let armIdleTimer: (() => void) | undefined;

    const followed = (async () => {
      for await (const event of events) {
        clearTimeout(idleTimer);

        if (signal?.aborted) {
          return;
        }

        if (event.type === 'stream-chunk' && isGenerateChunk(event.chunk)) {
          isDelivering = true;

          try {
            await onChunk(event.chunk);
          } catch (error) {
            onChunkFailure = { error };

            throw error;
          } finally {
            isDelivering = false;
          }
        }

        if (isAgentChatTurnEndEvent(event)) {
          return;
        }

        armIdleTimer?.();
      }
    })();

    // a failing channel only ends the reading, while a failing onChunk rejects the call
    const followedUnlessChannelFailed = followed.catch((error: unknown) => {
      if (isDefined(onChunkFailure)) {
        throw error;
      }
    });

    void followed.catch(() => undefined);
    // the race on the result may settle first, so this rejection must not go unhandled
    void followedUnlessChannelFailed.catch(() => undefined);

    const generated = requestGenerate({
      variables: { input: { ...variables.input, runId } },
      signal: runSignal,
    });

    // a failing channel or onChunk rejects at once, while delivering every chunk still waits for the result
    const result = await Promise.race([
      generated,
      followed.then(() => generated),
    ]);

    // the result is final, so a lost end event only stops the wait for more chunks after a quiet grace
    const runEnded = new Promise<void>((resolve, reject) => {
      armIdleTimer = () => {
        clearTimeout(idleTimer);

        if (!isDelivering) {
          idleTimer = setTimeout(resolve, END_EVENT_GRACE_MS);
        }
      };
      armIdleTimer();
      followedUnlessChannelFailed.then(() => resolve(), reject);
    });

    await Promise.race([runEnded, callerAborted]).finally(() =>
      clearTimeout(idleTimer),
    );

    stopFollowing.abort();
    // the caller's abort settles the call even while an onChunk is still running
    await Promise.race([followedUnlessChannelFailed, callerAborted]);

    // the reader ends quietly on abort, so an abort after the mutation returned would read as a full delivery
    signal?.throwIfAborted();

    return result;
  } finally {
    removeAbortListener();
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

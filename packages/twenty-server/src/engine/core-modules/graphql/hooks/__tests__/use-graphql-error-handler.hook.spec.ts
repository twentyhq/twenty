import { setupI18n } from '@lingui/core';
import { GraphQLError } from 'graphql';
import { createClient, type ExecutionResult } from 'graphql-sse';
import { PubSub } from 'graphql-subscriptions';
import {
  createSchema,
  createYoga,
  filter,
  pipe,
  type Plugin,
} from 'graphql-yoga';

import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';

const createTestYoga = (
  subscribe: () => AsyncIterableIterator<{ message: string }>,
) => {
  const errorLogger = jest.fn();
  const requestContextPlugin: Plugin<{
    req: { headers: Record<string, string> };
  }> = {
    onEnveloped: ({ extendContext }) => extendContext({ req: { headers: {} } }),
  };
  const yoga = createYoga({
    schema: createSchema({
      typeDefs: `
        type Query { ready: Boolean! }
        type Subscription { message: String! }
      `,
      resolvers: {
        Subscription: {
          message: {
            // Nest's Yoga driver wraps subscription filters this way.
            subscribe: () =>
              pipe(
                subscribe(),
                filter(() => true),
              ),
          },
        },
      },
    }),
    context: { req: { headers: {} } },
    maskedErrors: { isDev: false },
    logging: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: errorLogger,
    },
    plugins: [
      requestContextPlugin,
      useGraphQLErrorHandlerHook({
        metricsService: {
          incrementCounterForEvent: jest.fn(),
        },
        exceptionHandlerService: {
          captureExceptions: jest.fn(),
        },
        i18nService: {
          getI18nInstance: () => setupI18n({ locale: 'en', messages: {} }),
        },
        twentyConfigService: {
          get: jest.fn(),
        },
      }),
    ],
  });

  return { yoga, errorLogger };
};

const readSubscription = async (
  yoga: ReturnType<typeof createTestYoga>['yoga'],
) => {
  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream',
    },
    body: JSON.stringify({ query: 'subscription { message }' }),
  });

  return response.text();
};

describe('subscription error delivery', () => {
  beforeEach(() => jest.useRealTimers());
  afterEach(() => jest.useFakeTimers());

  it('delivers idle authorization revocation as a terminal SSE error result', async () => {
    const pubSub = new PubSub();
    const cleanup = jest.fn();
    const { yoga } = createTestYoga(() =>
      wrapAsyncIteratorWithLifecycle(
        () =>
          pubSub.asyncIterator<{ message: string }>(
            'message',
          ) as AsyncIterableIterator<{ message: string }>,
        {
          initialValue: { message: 'initial' },
          heartbeatIntervalMs: 20,
          heartbeatErrorBehavior: 'close',
          onHeartbeat: async () => {
            throw new NotFoundError('Thread not found');
          },
          onCleanup: cleanup,
        },
      ),
    );

    const body = await readSubscription(yoga);

    expect(body).toContain('"data":{"message":"initial"}');
    expect(body).toContain('"code":"NOT_FOUND"');
    expect(body).toContain('event: complete');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it.each(['NOT_FOUND', 'FORBIDDEN', 'UNAUTHENTICATED'])(
    'delivers %s to the graphql-sse client before completion',
    async (code) => {
      const cleanup = jest.fn();
      const { yoga } = createTestYoga(async function* () {
        try {
          yield { message: 'initial' };
          throw new GraphQLError('Access denied', { extensions: { code } });
        } finally {
          cleanup();
        }
      });
      const client = createClient({
        url: 'http://localhost/graphql',
        fetchFn: yoga.fetch,
        retryAttempts: 0,
      });
      const results: ExecutionResult<Record<string, unknown>, unknown>[] = [];

      try {
        await new Promise<void>((resolve, reject) => {
          client.subscribe(
            { query: 'subscription { message }' },
            {
              next: (value) => results.push(value),
              error: reject,
              complete: resolve,
            },
          );
        });
      } finally {
        client.dispose();
      }

      expect(results).toEqual([
        { data: { message: 'initial' } },
        {
          errors: [
            expect.objectContaining({
              extensions: expect.objectContaining({ code }),
            }),
          ],
        },
      ]);
      expect(cleanup).toHaveBeenCalledTimes(1);
    },
  );

  it('keeps unexpected source failures masked and logged', async () => {
    const { yoga, errorLogger } = createTestYoga(async function* () {
      yield { message: 'initial' };
      throw new Error('private database connection details');
    });

    const body = await readSubscription(yoga);

    expect(body).toContain('"data":{"message":"initial"}');
    expect(body).toContain('Unexpected error.');
    expect(body).not.toContain('private database connection details');
    expect(body).toContain('event: complete');
    expect(errorLogger).toHaveBeenCalled();
  });

  it('preserves normal payloads and completion', async () => {
    const { yoga, errorLogger } = createTestYoga(async function* () {
      yield { message: 'first' };
      yield { message: 'second' };
    });

    const body = await readSubscription(yoga);

    expect(body).toContain('"data":{"message":"first"}');
    expect(body).toContain('"data":{"message":"second"}');
    expect(body).toContain('event: complete');
    expect(body).not.toContain('errors');
    expect(errorLogger).not.toHaveBeenCalled();
  });

  it('preserves denial before a subscription opens', async () => {
    const { yoga } = createTestYoga(() => {
      throw new NotFoundError('Thread not found');
    });

    const body = await readSubscription(yoga);

    expect(body).toContain('"code":"NOT_FOUND"');
    expect(body).toContain('event: complete');
    expect(body).not.toContain('"data"');
  });

  it('releases an idle source when the SSE reader disconnects', async () => {
    const pubSub = new PubSub();
    const cleanup = jest.fn();
    let finishCleanup!: () => void;
    const cleanupFinished = new Promise<void>((resolve) => {
      finishCleanup = resolve;
    });
    const { yoga } = createTestYoga(() =>
      wrapAsyncIteratorWithLifecycle(
        () =>
          pubSub.asyncIterator<{ message: string }>(
            'message',
          ) as AsyncIterableIterator<{ message: string }>,
        {
          initialValue: { message: 'initial' },
          onCleanup: async () => {
            cleanup();
            finishCleanup();
          },
        },
      ),
    );
    const response = await yoga.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
      },
      body: JSON.stringify({ query: 'subscription { message }' }),
    });
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Missing SSE response body');
    }

    let body = '';
    const decoder = new TextDecoder();

    try {
      while (!body.includes('initial')) {
        const chunk = await reader.read();

        if (chunk.done) {
          throw new Error('Subscription ended before its initial result');
        }
        body += decoder.decode(chunk.value);
      }
    } finally {
      await reader.cancel();
    }

    await cleanupFinished;
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

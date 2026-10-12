import { describe, expect, it, vi } from 'vitest';

import { createDevOutput } from '@/app/dev/create-dev-output';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';

describe('dev stream output', () => {
  it('serializes build and sync events under backpressure and bounds buffered progress', async () => {
    const drain = Promise.withResolvers<void>();
    const event = vi.fn(async () => {
      await drain.promise;
    });
    const context: TargetCommandContext = {
      command: 'app dev',
      arguments: [],
      options: {},
      outputMode: 'ndjson',
      signal: new AbortController().signal,
      target: {
        apiUrl: 'http://localhost:3000',
        bearerToken: 'test',
        credentialKind: 'apiKey',
        source: 'environment',
      },
      output: {
        event,
        progress: vi.fn(),
        warn: vi.fn(),
        succeed: vi.fn(),
        fail: vi.fn(),
      },
    };
    const output = createDevOutput(context);
    for (let index = 0; index < 1000; index += 1)
      output.output.warn({ code: 'WARNING', message: `warning ${index}` });
    const first = output.emit(
      { kind: 'build-start', message: 'Building' },
      context.signal,
    );
    const second = output.emit(
      { kind: 'sync-start', message: 'Syncing' },
      context.signal,
    );
    await vi.waitFor(() => expect(event).toHaveBeenCalledOnce());
    expect(event).toHaveBeenCalledWith(
      'progress',
      expect.objectContaining({
        messages: expect.arrayContaining([
          { message: '968 additional progress messages omitted.' },
        ]),
      }),
      context.signal,
    );
    drain.resolve();
    await Promise.all([first, second]);
    expect(event).toHaveBeenCalledTimes(2);
  });
});

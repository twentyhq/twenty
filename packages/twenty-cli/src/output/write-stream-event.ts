import { once } from 'node:events';

export const writeStreamEvent = async (event: unknown, signal: AbortSignal) => {
  signal.throwIfAborted();

  if (!process.stdout.write(`${JSON.stringify(event)}\n`)) {
    await once(process.stdout, 'drain', { signal });
  }

  signal.throwIfAborted();
};

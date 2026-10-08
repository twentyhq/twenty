import { createInterface } from 'node:readline/promises';

import { createCancelledError } from '@/output/create-cancelled-error';

export const promptInTerminal = async ({
  question,
  signal,
}: {
  question: string;
  signal: AbortSignal;
}): Promise<string> => {
  signal.throwIfAborted();

  const terminal = createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  const cancellation = new AbortController();
  const cancel = () => cancellation.abort();

  terminal.on('SIGINT', cancel);
  terminal.on('close', cancel);

  try {
    return await terminal.question(question, {
      signal: AbortSignal.any([signal, cancellation.signal]),
    });
  } catch (error) {
    if (signal.aborted || cancellation.signal.aborted) {
      throw createCancelledError();
    }

    throw error;
  } finally {
    terminal.close();
  }
};

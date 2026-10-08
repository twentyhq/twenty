import { createInterface } from 'node:readline/promises';

import { createCancelledError } from '@/output/create-cancelled-error';

const YES_ANSWER_PATTERN = /^y(es)?$/i;

export const confirmInTerminal = async ({
  question,
  signal,
}: {
  question: string;
  signal: AbortSignal;
}) => {
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
    const answer = await terminal.question(`${question} [y/N] `, {
      signal: AbortSignal.any([signal, cancellation.signal]),
    });

    return YES_ANSWER_PATTERN.test(answer.trim());
  } catch (error) {
    if (signal.aborted || cancellation.signal.aborted) {
      throw createCancelledError();
    }

    throw error;
  } finally {
    terminal.close();
  }
};
